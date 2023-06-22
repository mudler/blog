---
title: 'Question Answering on Documents locally with LangChain, LocalAI, Chroma, and GPT4All'
date: 2023-05-12
draft: false
---

There has been a lot of fuzz around AI, langchain, and what you can do with AI nowadays. In this blog post, I'm going to deep dive on how to create a little assistant for you or your team over Slack that can answer to your documentation.

![Kairos-TPM-Slackbot](https://github.com/spectrocloud-labs/Slack-QA-bot/assets/2420543/6047e1ff-22d5-4b03-9d73-fcb7fb19a2c1)

## The problem

I work at [Spectro Cloud](https://www.spectrocloud.com/), and we have a very cool open source project called [Kairos](https://kairos.io) (check it out at https://kairos.io if you want to learn about it more!) which is a Meta-Linux, immutable distribution focused on running Kubernetes at the Edge. One among of the challenge we have, beside writing good documentation, is making that easy to access and consume for our community, also, documentation moves fast, and its easy to get lost.

When a project generates lot of documentation, it is not only hard to navigate it, but also to find exactly what you are looking for. 

There are quite of few services that nowadays are offering question answering to enhance documentation. But if you are like me that want to understand how something work behind the scene, and try to build your own, keep reading.

In this post I'm going to show you how to setup your own, personal Slack bot that can answer questions on a documentation website, github issues, and code. At the end of this article you will be able to deploy this bot with docker or Kubernetes, for yourself or for your team at work!

## The plan

This is how it works: our code will create a vector database containing a vector representation of chunks of the documentation, code, and github issues. For this purpose we will use Langchain and ChromaDB to create a vector database. Langchain is a powerful library that allows to interact with LLMs, and ChromaDB is a local database that can be used to store documents in forms of embeddings.
Embeddings, are vectors representing a string. Embedding databases are used to search _semantically_ against a dataset.

For the LLM inference we are going to use also LocalAI. LocalAI allows to run LLMs and acts as a drop-in replacement for OpenAI. We could of course use other ways to interact with LLM locally, but in this case I do want to have a separate split between what runs the model and the application logic, so I can focus more on the core of my bot. I think it keeps things much easier to maintain and update on the go (we can always replace new models behind the scenes, without touching our code!) and we can leverage the OpenAI libraries already, quite handy. We will fake to write code to work with OpenAI, but we will try that out locally. that also gives us the possibility to even use the same code with OpenAI directly, or Azure.

A recap of what we will need:

- A bit of python and Docker to create a container image with our slack bot
- LocalAI to run LLMs locally (no GPU required, just a modern CPU)
- Some LLM model of choice ( I personally found airoboros quite good for Q&A )
- No OpenAI api keys needed, or any external service! we are going to host the bot on our own, without any need to interact remote API for the AI stuff.
- If deploying on Kubernetes in the cloud you need a cluster, of you are running on a baremetal, I've tried this on Kairos (https://kairos.io)

## How the bot works

You can directly jump to the Setup section below if you are not interested in the details, here I'm going to explain how the bot works.

The bot is a generic Slack bot adapted to answer on datasets using langchain. You can view the full code of the bot here: https://github.com/spectrocloud-labs/Slack-QA-bot, the interesting part of the bot is the `memory_ops.py` file (https://github.com/spectrocloud-labs/Slack-QA-bot/blob/main/app/memory_ops.py), what we do in there is:

- Build a knowledgebase for the bot to ask questions later on
- When being asked questions, use the knowledgebase to enhance the answer

### Build a knowledge base

The gist of the bot is in this python function:

```python

def build_knowledgebase(sitemap):
    # Load environment variables
    repositories = os.getenv("REPOSITORIES").split(",")
    issue_repos = os.getenv("ISSUE_REPOSITORIES").split(",")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)
    chunk_size = 500
    chunk_overlap = 50

    git_loaders = []
    for repo in repositories:
        git_loader = GitLoader(
            clone_url=os.getenv(f"{repo}_CLONE_URL"),
            repo_path=f"/tmp/{repo}",
            branch=os.getenv(f"{repo}_BRANCH", "main")
        )
        git_loaders.append(git_loader)
    for repo in issue_repos:
        loader = GitHubIssuesLoader(
            repo=repo,
        )
        git_loaders.append(loader)

    sitemap_loader = SitemapLoader(web_path=sitemap)
    documents = []
    for git_loader in git_loaders:
        documents.extend(git_loader.load())
    documents.extend(sitemap_loader.load())

    for doc in documents:
        doc.metadata = fix_metadata(doc.metadata)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    texts = text_splitter.split_documents(documents)

    print(f"Creating embeddings. May take some minutes...")
    db = Chroma.from_documents(texts, embeddings, persist_directory=PERSIST_DIRECTORY, client_settings=CHROMA_SETTINGS)
    db.persist()
    db = None
```

We use the `HuggingFaceEmbeddings` which are run locally (`embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)`), and we use Langchain to split the document into chunks and Chroma to construct a vector database. 

The code above uses the Github Loaders and GithubIssue loader from Langchain to retrieve informations about code and Github issues of various Github repositories that can be defined via environment. We also use the `SitemapLoader` so to ingest a `sitemap.xml` file and scrape an entire website. This is particularly useful if you already have a documentation or a website.

### Query the knowledge base

The other important piece of the code is how we then ask the AI, and how we enhance the result of our search.

```python

def ask_with_memory(line) -> str:
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)
    db = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings, client_settings=CHROMA_SETTINGS)
    retriever = db.as_retriever()

    res = ""
    llm = ChatOpenAI(temperature=0, openai_api_base=BASE_PATH, model_name=OPENAI_MODEL)
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True)

    # Get the answer from the chain
    res = qa("---------------------\n Given the context above, answer to the following question: " + line)
    answer, docs = res['result'], res['source_documents']
    res = answer + "\n\n\n" + "Sources:\n"
    # Print the relevant sources used for the answer
    for document in docs:
        if "source" in document.metadata:
            res += "\n---------------------\n" + document.metadata["source"] + "\n---------------------\n"
        else:
            res += "\n---------------------\n No source available (sorry!) \n---------------------\n"
        res += "```\n"+document.page_content+"\n```"
    return res
```

Here we load again the previously created Embedding database and configure the langchain `RetrievalQA` object. Once we have built the knowledgebase, it's enough to point to the embedding database and specify the embedding engine. In this case we use local embeddings with huggingface, but others could have been used as well (for instance, LocalAI also has its own embedding mechanism that could have been used too).

We then configure the `llm` to use LocalAI. Note we use ChatOpenAI and we set `openai_api_base` so we can use [LocalAI](https://github.com/go-skynet/LocalAI) instead.

## Setup

We are ready to setup our bot! let's see what we need:

- Set up a Slack server and gain access to add new applications
- Create a GitHub repository (optional) and obtain the Personal Access Token to fetch issues from a repository
- Ensure your website has an accessible `sitemap.xml` file so that our bot can scrape the website content
- Host the `docker` and `docker-compose` applications
- Choose a model for use with LocalAI (refer to https://github.com/go-skynet/LocalAI)

and that's it, we don't need any OpenAI API key, or any external service except Github, but that we use to get the content that we want to index.

### Clone the required files

We will run everything locally with Docker, but at the end of the article I'm sharing also a deployment file that works in Kubernetes.

I have pushed the example in LocalAI, so clone the repository locally:

```
git clone https://github.com/go-skynet/LocalAI
cd LocalAI/examples/slack-qa-bot
```

You will find a `docker-compose.yaml` and a `.env.example` file. We will need to edit the `.env` files with the `Slack` tokens in order for the bot to connect.

### Configure Slack

We need to create an application in the Slack workspace we want to install the bot. To create the app we will use the [manifest-dev.yml](https://raw.githubusercontent.com/spectrocloud-labs/Slack-QA-bot/main/manifest-dev.yml) file in the repository. and use it when creating a new application:

- Go to https://api.slack.com/apps/ and click on "Create new App"
![Screenshot from 2023-06-22 15-02-52](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/9e474872-0d24-4601-b453-679f3601de18)

- Select "From an app Manifest"
![Screenshot from 2023-06-22 15-03-03](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/962de606-a694-47ad-8fc0-cd096668e07f)

- Pick a workspace for the bot:

![Screenshot from 2023-06-22 15-03-25](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/37573a42-87b6-4351-ad19-303e5ad610ed)

- Enter the app manifest by copying the content of: https://raw.githubusercontent.com/spectrocloud-labs/Slack-QA-bot/main/manifest-dev.yml
![Screenshot from 2023-06-22 15-04-11](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/f134d1c6-eded-4114-81a0-d5fa2f870baf)

- Install the app in your workspace:
![Screenshot from 2023-06-22 15-04-55](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/cf84d743-6ccd-41a5-9b7e-41591b6d4939)

- Create an app level token with connection:write scope. The will save this token and we will use it as `SLACK_APP_TOKEN`

![Screenshot from 2023-06-22 15-07-51](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/997573a6-8fb7-4357-b811-bdd01e52b158)

![Screenshot from 2023-06-22 15-08-04](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/763b1854-2b5a-4690-b5fa-a17fd720f40d)

- Now let's get the OAuth token, go into the OAuth & Permissions and copy the OAuth Token. We will use that as `SLACK_BOT_TOKEN`.

![Screenshot from 2023-06-22 15-10-23](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/ce8eff39-305c-482c-98c6-ed9a03994b3b)


![Screenshot from 2023-06-22 15-10-32](https://github.com/seratch/ChatGPT-in-Slack/assets/2420543/96f2abe6-9bae-47f5-b08b-c569c138cf00)

### Modify the .env file

Copy the example env file:

```
cp -rfv .env.example .env
```

and change the `SLACK_APP_TOKEN` and `SLACK_BOT_TOKEN` that we generated in the steps before.

Change also the URL of the website to index in `SITEMAP`.


### Run with docker-compose

By default, local-ai will prepare and use the gpt4all-j model. That works in most cases, but you might change models by following docs (or ask in the forums/discord!)

```
docker-compose up
```

or if you are running docker with `docker compose`:

```
docker compose up
```

### Try it out!

The bot should start, but eventually you can ask it questions about the documentation in the channel, like in this video, linking to the sources in the docs:

![Kairos-TPM-Slackbot](https://github.com/spectrocloud-labs/Slack-QA-bot/assets/2420543/6047e1ff-22d5-4b03-9d73-fcb7fb19a2c1)


### Bonus: Setup other models

The `.env` file specifies to configure gpt4all automatically, however you can use other models by copying the manually in the models folder, or use the gallery:

```
# See: https://github.com/go-skynet/model-gallery
PRELOAD_MODELS=[{"url": "github:go-skynet/model-gallery/gpt4all-j.yaml", "name": "gpt-3.5-turbo"}]
```
The `PRELOAD_MODELS` environment variable in the `.env` file specifies the configuration for the `gpt-3.5-turbo` model. See also: https://github.com/go-skynet/model-gallery in order to run other models from the gallery. 

To run manually models, see the `chatbot-ui-manual` example in LocalAI, and comment the `PRELOAD_MODELS` environment variable.

### Bonus: Kubernetes setup

This is a manifest which can be used as a starting point:
```
apiVersion: v1
kind: Namespace
metadata:
  name: slack-bot
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: knowledgebase
  namespace: slack-bot
  labels:
    app: localai
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: localai
  namespace: slack-bot
  labels:
    app: localai
spec:
  selector:
    matchLabels:
      app: localai
  replicas: 1
  template:
    metadata:
      labels:
        app: localai
      name: localai
    spec:
      containers:
        - name: localai-slack
          env:
          - name: OPENAI_API_KEY
            value: "x"
          - name: SLACK_APP_TOKEN
            value: "xapp-1-"
          - name: SLACK_BOT_TOKEN
            value: "xoxb-"
          - name: OPENAI_MODEL
            value: "gpt-3.5-turbo"
          - name: OPENAI_TIMEOUT_SECONDS
            value: "400"
          - name: OPENAI_SYSTEM_TEXT
            value: ""
          - name: MEMORY_DIR
            value: "/memory"
          - name: TRANSLATE_MARKDOWN
            value: "true"
          - name: OPENAI_API_BASE
            value: "http://local-ai.default.svc.cluster.local:8080"
          - name: REPOSITORIES
            value: "KAIROS,AGENT,SDK,OSBUILDER,PACKAGES,IMMUCORE"
          - name: KAIROS_CLONE_URL
            value: "https://github.com/kairos-io/kairos"
          - name: KAIROS_BRANCH
            value: "master"
          - name: AGENT_CLONE_URL
            value: "https://github.com/kairos-io/kairos-agent"
          - name: AGENT_BRANCH
            value: "main"
          - name: SDK_CLONE_URL
            value: "https://github.com/kairos-io/kairos-sdk"
          - name: SDK_BRANCH
            value: "main"
          - name: OSBUILDER_CLONE_URL
            value: "https://github.com/kairos-io/osbuilder"
          - name: OSBUILDER_BRANCH
            value: "master"
          - name: PACKAGES_CLONE_URL
            value: "https://github.com/kairos-io/packages"
          - name: PACKAGES_BRANCH
            value: "main"
          - name: IMMUCORE_CLONE_URL
            value: "https://github.com/kairos-io/immucore"
          - name: IMMUCORE_BRANCH
            value: "master"
          - name: GITHUB_PERSONAL_ACCESS_TOKEN
            value: ""
          - name: ISSUE_REPOSITORIES
            value: "kairos-io/kairos"
          image: quay.io/spectrocloud-labs/slack-qa-local-bot:qa
          imagePullPolicy: Always
          volumeMounts:
            - mountPath: "/memory"
              name: knowledgebase
      volumes:
        - name: knowledgebase
          persistentVolumeClaim:
            claimName: knowledgebase
```

Note:

- `OPENAI_API_BASE` is set to the default if installing the `local-ai` chart into the default namespace listening on 8080. Specify a different LocalAI url here.