---
title: 'Question Answering on Documents locally with LangChain, LocalAI, Chroma, and GPT4All'
date: 2023-05-12
draft: false
---

Have you ever dreamed of building AI-native applications that can leverage the power of large language models (LLMs) without relying on expensive cloud services or complex infrastructure? If so, you’re not alone. Many developers are looking for ways to create and deploy AI-powered solutions that are fast, flexible, and cost-effective, or just experiment locally. In this blog post, I’m going to show you how you can use three amazing tools and a language model like gpt4all to : LangChain, LocalAI, and Chroma.

- [Chroma](https://www.trychroma.com/) is a vector store and embedding database designed for AI workloads. 

- [Gpt4all](https://gpt4all.io/index.html) is an ecosystem of open-source chatbots trained on a massive collections of clean assistant data including code, stories and dialogue. 

- [LocalAI](https://github.com/go-skynet/LocalAI) is a self-hosted, community-driven, local OpenAI-compatible API that can run on CPU with consumer-grade hardware. It enables you to run models locally or on-prem without the need for internet connectivity or external servers.

- [LangChain](https://python.langchain.com/en/latest/) is a modular and flexible framework for developing AI-native applications using LLMs.

Together, these four tools form a powerful combination that can help you create and deploy AI-native applications with ease and efficiency. In the following sections, I’ll show you how to use them in practice to do question answering on a document.

## LocalAI

![](https://user-images.githubusercontent.com/2420543/233147843-88697415-6dbf-4368-a862-ab217f9f7342.jpeg)

[LocalAI](https://github.com/go-skynet/LocalAI) is a drop-in replacement REST API compatible with OpenAI for local CPU inferencing. It allows you to run models locally or on-prem with consumer grade hardware, supporting multiple models families. LocalAI is a community-driven project, focused on making the AI accessible to anyone.

LocalAI uses C++ bindings for optimizing speed and performance. It is based on [llama.cpp](https://github.com/ggerganov/llama.cpp) gpt4all, rwkv.cpp, ggml, whisper.cpp for audio transcriptions, and bert.cpp for embedding. LocalAI also supports GPT4ALL-J which is licensed under Apache 2.0, and MosaicLM PT models which are also usable for commercial applications. (see [here the table of supported models](https://github.com/go-skynet/LocalAI#model-compatibility-table))

To use LocalAI, you need to install it on your machine and run it as a service, or either on the cloud or in a dedicated environment. You can then use the same API endpoints as OpenAI to interact with the models. For example, you can use the `/v1/models` endpoint to list the available models, or the `/v1/completions` endpoint to generate text completions, but computation is executed locally, with CPU-compatible models. You can download models from [Gpt4all](https://gpt4all.io/index.html).

LocalAI also supports various ranges of configuration and prompt templates, which are predefined prompts that can help you generate specific outputs with the models. For example, you can use the summarizer template to generate summaries of texts, or the sentiment-analyzer template to analyze the sentiment of texts. You can find more [examples](https://github.com/go-skynet/LocalAI/tree/master/examples) and [prompt templates](https://github.com/go-skynet/LocalAI/tree/master/prompt-templates) in the [LocalAI](https://github.com/go-skynet/LocalAI) repository.

## Langchain and Chroma

![](https://blog.langchain.dev/content/images/size/w1000/2023/02/langchain-chroma-light.png)

[Chroma](https://www.trychroma.com/) is a vector store and embedding database designed for AI workloads. It allows you to store and work with embeddings, which are the AI-native way to represent any kind of data. It also offers high performance and flexibility for working with different types of embeddings and algorithms. Chroma was founded to build tools that leverage the power of embeddings. Embeddings are the perfect fit for working with all kinds of AI-powered tools and algorithms, such as LLMs, semantic search, example selection, and more. 

[LangChain](https://python.langchain.com/en/latest/) is a modular and flexible framework for developing AI-native applications using LLMs. It allows you to easily prototype and experiment with different models, data sources, and use cases, such as chat bots, question answering services, and agents. LangChain also provides a rich ecosystem of integrations with other tools and platforms, such as Notion, PDFs, ClearML, CerebriumAI, and more.

Together, those are powerful and convenient tools that can help you store and work with embeddings in a simple and efficient way. It can also help you enhance your LLM applications with pluggable knowledge, facts, and skills. In the next section, I’ll show you how to use LangChain and Chroma together with LocalAI to create and deploy AI-native applications locally.

## Question answering with LocalAI, ChromaDB and Langchain

In this example, I'll show you how to use `LocalAI` with the `gpt4all` models with `LangChain` and `Chroma` to enable question answering on a set of documents. We’ll use the state of the union speeches from different US presidents as our data source, and we’ll use the `ggml-gpt4all-j` model served by LocalAI to generate answers. Note, you can use any model compatible with `LocalAI`.

To run this example, you’ll need to have LocalAI, LangChain, and Chroma installed on your machine. You’ll also need to download the models and the data files from the links provided below. Alternatively, you can use the docker-compose file to start the LocalAI API and the Chroma service with the models and data already loaded.

The example consists of two steps: creating a storage and querying the storage. In the first step, we’ll use LangChain and Chroma to create a local vector database from our document set. This will allow us to perform semantic search on the documents using embeddings. In the second step, we’ll use LangChain and LocalAI to query the storage using natural language questions. We’ll use the gpt4all model served by LocalAI using the _OpenAI_ api and python client to generate answers based on the most relevant documents. The key aspect here is that we will configure the python client to use the LocalAI API endpoint instead of OpenAI.

### Step 1: Start LocalAI

To start LocalAI, we can either build it locally or use `docker-compose`. Note the steps here are for `Linux` machines. If you are on `Mac` you need to build the binary manually:

```
# Clone LocalAI
git clone https://github.com/go-skynet/LocalAI

cd LocalAI/examples/langchain-chroma

# Download models
wget https://huggingface.co/skeskinen/ggml/resolve/main/all-MiniLM-L6-v2/ggml-model-q4_0.bin -O models/bert
wget https://gpt4all.io/models/ggml-gpt4all-j.bin -O models/ggml-gpt4all-j

docker-compose up
```

This will start the LocalAI server locally, with the models required for embeddings (`bert`) and for question answering (`gpt4all`). 

Note: The example contains a `models` folder with the configuration for `gpt4all` and the `embeddings` models already prepared. LocalAI will map gpt4all to `gpt-3.5-turbo` model, and `bert` to the embeddings endpoints.

### Step 2: Create a vector database

To create a vectore database, we’ll use a script which uses LangChain and Chroma to create a collection of documents and their embeddings. The script takes a text file as input, where each line is a document. In our case, we’ll use the `state_of_the_union.txt` file, which we will use to ask it questions later for.

Download the data:

```
# Download data used for training
wget https://raw.githubusercontent.com/hwchase17/chat-your-data/master/state_of_the_union.txt
```

The python OpenAI client allows to set an API key and a API target host with those two environment variables:

- `OPENAI_API_BASE`: The base URL of the OpenAI API. If we run LocalAI locally, we set it to http://localhost:8080/v1
- `OPENAI_API_KEY`: The API key for the OpenAI API. We have to set it to something, but doesn't really matter

Our script will do the following:

- It imports the necessary modules from the langchain library and the os module.
- It sets the base_path variable to the OpenAI API endpoint, which is used to access the OpenAI embeddings model.
- It creates a `TextLoader` object that loads the text file and returns a list of documents (each document is a string).
- It creates a `CharacterTextSplitter` object that splits each document into smaller chunks of 300 characters with an overlap of 70 characters.
    - Alternatively, it can use a `TokenTextSplitter` object that splits each document into tokens (words or punctuation marks) or `RecursiveCharacterTextSplitter`.
- It creates an OpenAIEmbeddings object that uses the `text-embedding-ada-002` model to generate embeddings (numeric representations) for each chunk of text. Since we set `OPENAI_API_BASE` it will use LocalAI instead.
- It creates a Chroma object that stores the embeddings in a vector database. It also specifies a persist_directory where the embeddings are saved on disk.
- It calls the persist method to save the embeddings.

```python

import os
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter,TokenTextSplitter,CharacterTextSplitter
from langchain.llms import OpenAI
from langchain.chains import VectorDBQA
from langchain.document_loaders import TextLoader

base_path = os.environ.get('OPENAI_API_BASE', 'http://localhost:8080/v1')

# Load and process the text
loader = TextLoader('state_of_the_union.txt')
documents = loader.load()

text_splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=70)
#text_splitter = TokenTextSplitter()
texts = text_splitter.split_documents(documents)

# Embed and store the texts
# Supplying a persist_directory will store the embeddings on disk
persist_directory = 'db'

embedding = OpenAIEmbeddings(model="text-embedding-ada-002")
vectordb = Chroma.from_documents(documents=texts, embedding=embedding, persist_directory=persist_directory)

vectordb.persist()
vectordb = None
```

To run the script, execute the following commands:

```
# Set environment variables
export OPENAI_API_BASE=http://localhost:8080/v1
export OPENAI_API_KEY=sk-

# Run store.py script
python store.py
```

After it finishes, a directory named `db` will be created with the vector index database.

### Step 3: Query the storage

Now we can query our vector database with `gpt4all`.

To query the storage, we’ll use a python script which uses LangChain and LocalAI to generate answers from natural language questions.


Our script will do the following:

- It imports the necessary modules from LangChain and os.
- It calculate embeds the question using the OpenAIEmbeddings class, which uses the OpenAI API to generate embeddings for each text chunk. - However, since we set `OPENAI_API_BASE` it will use **LocalAI** instead. It also uses the Chroma class, which is a vector store that can persist the embeddings on disk for later use.
- It creates a question answering system using the VectorDBQA class, which can query the vector store using natural language questions. It also uses the OpenAI class, which is a wrapper for the OpenAI API that can specify parameters such as temperature and model name. In this case, it uses the `gpt-3.5-turbo` model, and LocalAI is configured to redirect requests to the `gpt4all` model instead.
- Finally, it runs a sample query on the question answering system, asking “What the president said about taxes ?” and prints the answer.

```python
import os
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.chains import VectorDBQA

base_path = os.environ.get('OPENAI_API_BASE', 'http://localhost:8080/v1')

# Load and process the text
embedding = OpenAIEmbeddings()
persist_directory = 'db'

# Now we can load the persisted database from disk, and use it as normal. 
vectordb = Chroma(persist_directory=persist_directory, embedding_function=embedding)
qa = VectorDBQA.from_chain_type(llm=OpenAI(temperature=0, model_name="gpt-3.5-turbo", openai_api_base=base_path), chain_type="stuff", vectorstore=vectordb)

query = "What the president said about taxes ?"
print(qa.run(query))
```

To run the script, execute the following commands:

```
# Set environment variables
export OPENAI_API_BASE=http://localhost:8080/v1
export OPENAI_API_KEY=sk-

# Run query.py
python query.py
# President Trump recently stated during a press conference regarding tax reform legislation that "we're getting rid of all these loopholes." He also mentioned that he wants to simplify the system further through changes such as increasing the standard deduction amount and making other adjustments aimed at reducing taxpayers' overall burden.    
```

## Conclusions:

In this blog post, we showed you how to use LangChain and Chroma together with LocalAI to enable question answering on a set of documents. We used the state of the union speeches from different US presidents as our data source, and we used the ggml-gpt4all-j model from LocalAI to generate answers. We also used Chroma as a vector store and embedding database to perform semantic search on the documents using embeddings.

This is just one example of how you can use these three amazing tools to create and deploy AI-native applications with ease and efficiency. You can also use them for other use cases, such as chat bots, agents, summarizers, sentiment analyzers, and more. You can also use different models, data sources, and integrations with other tools and platforms.

We hope you enjoyed this blog post and learned something new. If you want to try it out for yourself, you can find the code and the instructions in [this GitHub repo](https://github.com/go-skynet/LocalAI/tree/master/examples/langchain-chroma). You can also find more resources and documentation for LangChain, LocalAI, and Chroma in the links below.

- Chroma: https://docs.trychroma.com/
- GPT4all: https://github.com/nomic-ai/gpt4all
- LangChain: https://python.langchain.com/en/latest/
- LocalAI: https://github.com/go-skynet/LocalAI

We’d love to hear your feedback and suggestions on how to improve these tools and make them more useful for you. You can join our Discord channels and chat with us and other developers:

## Links

- Full example code: https://github.com/go-skynet/LocalAI/tree/master/examples/langchain-chroma
- LocalAI examples: https://github.com/go-skynet/LocalAI/tree/master/examples
- Github: https://github.com/go-skynet/LocalAI
- Follow us on Twitter: https://twitter.com/LocalAI_API
- Upvote on Hacker news: https://news.ycombinator.com/item?id=35726934
- Join our Discord: https://discord.gg/uJAeKSAGDy

Thank you for reading and happy coding!