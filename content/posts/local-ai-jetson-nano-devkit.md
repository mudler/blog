---
title: 'LocalAI and llama.cpp on Jetson Nano Devkit'
date: 2024-05-30
draft: false
---

If you are a lucky(?) owner of the Jetson Nano Devkit (4GB), and you don't know anymore on what to do with it, you can try to run LocalAI with llama.cpp on it. 

The Jetson Nano Devkit is currently not supported anymore by Nvidia, and receives little to no attention, however, it can _still_ do something, and if you are like me that recycles the board at home, you might want to have fun with it by running AI on top of it. It might be also good candidate for the workload distribution features that LocalAI has (see: https://localai.io/features/distribute/), but leaving that for another post.

Disclaimer: you aren't going to run big models with it, but phi-3 runs and you can have fun with it!

I'll leave to another post for the setup I got with the Orin AGX, this covers for now only the Jetson Nano devkit as I recently did these steps to prepare a cluster to show-off on one of my upcoming talks!

![Screenshot from 2024-05-31 19-16-18](https://github.com/mudler/blog/assets/2420543/f7c050b6-3b08-4652-99d1-51438a1a7300)

## Requirements

First of all, you need to get the latest Jetson Nano Devkit tooling that is - by now - it is 32.7.4.

```bash
wget https://developer.nvidia.com/downloads/embedded/l4t/r32_release_v7.4/t210/jetson-210_linux_r32.7.4_aarch64.tbz2
tar -xvf jetson-210_linux_r32.7.4_aarch64.tbz2
cd Linux_for_Tegra
```

Then you need to flash the device with the latest image, so we need a rootfs:

```bash
wget https://developer.nvidia.com/downloads/embedded/l4t/r32_release_v7.4/t210/tegra_linux_sample-root-filesystem_r32.7.4_aarch64.tbz2
mkdir rootfs
tar -xvf tegra_linux_sample-root-filesystem_r32.7.4_aarch64.tbz2 -C rootfs
```

Reminder: you need to prepare the rootfs by running (and requires QEMU with aarch64 support):

```bash
sudo ./apply_binaries.sh
```

Then you can flash the device with the following command:

```bash
sudo ./flash.sh jetson-nano-devkit-emmc mmcblk0p1
```

Make sure to put the device in recovery mode before running the flash command (notes below).

### Enter recovery mode

- Jumper the J48 power select pin first and plug the power jack (optional, depend on devkit board)
- Jumper the recovery pin and the reset pin. In my case it was on the edge of the Compute module.
- Plug the MicroUSB cable to the PC
- Plug the power to the board (DC on the board)

#### Verify you are in recovery mode

You should be able to see the Nvidia device as `NVIDIA Corp. APX` by running “lsusb” command on your host.

```
# lsusb
Bus 004 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 003 Device 004: ID 0a5c:5842 Broadcom Corp. 58200
Bus 003 Device 003: ID 0bda:554c Realtek Semiconductor Corp. Integrated_Webcam_FHD
Bus 003 Device 079: ID 0955:7f21 NVIDIA Corp. APX
Bus 003 Device 005: ID 8087:0033 Intel Corp. 
Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

## Cleanup 

We might need some extra space, especially if you are booting from the eMMC like me. We can remove all the graphical packages and docs like this on a booted system, but this might be a bit of a delicate process, beware and make sure you know what you are doing before running this command:

```bash
sudo apt-get remove ubuntu-desktop gnome-* libreoffice*
while read p; do
  sudo apt-get remove -y "$p"
done < <(curl -L https://raw.githubusercontent.com/NVIDIA-AI-IOT/jetson-min-disk/main/assets/nvubuntu-bionic-packages_only-in-desktop.txt)
sudo apt-get install network-manager
sudo dpkg -r --force-depends "cuda-documentation-10-2" "cuda-samples-10-2" "libnvinfer-samples" "libvisionworks-samples" "libnvinfer-doc" "vpi1-samples"
```

## Install Build dependencies

The packages on the Jetson Nano are really old ( we are talking about gcc 7 ! ) as this is an Ubuntu 18.04.

We need then to install few things manually to go ahead:

### Cmake

```bash
# Install CMAKE: 
wget https://github.com/Kitware/CMake/releases/download/v3.26.4/cmake-3.26.4.tar.gz
tar xvf cmake-3.26.4.tar.gz
cd cmake-3.26.4
./configure
make
make install
```

### GCC-8

We need gcc 8 for `-std=c++20`

```bash
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt-get install -y gcc-8 g++-8
```

You might need to setup alternatives, just in case ( I didn't had to ):

```bash
#Remove the previous alternatives
sudo update-alternatives --remove-all gcc
sudo update-alternatives --remove-all g++

#Define the compiler
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-8 30
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-8 30

sudo update-alternatives --install /usr/bin/cc cc /usr/bin/gcc 30
sudo update-alternatives --set cc /usr/bin/gcc

sudo update-alternatives --install /usr/bin/c++ c++ /usr/bin/g++ 30
sudo update-alternatives --set c++ /usr/bin/g++

#Confirm and update (You can use the default setting)
sudo update-alternatives --config gcc
sudo update-alternatives --config g++
```

### Install cuda

```bash
sudo apt-get install -y nvidia-cuda zlib1g-dev
```

### Install protoc

Protoc in repositories is old! get the latest one:

```bash
curl -L -s https://github.com/protocolbuffers/protobuf/releases/download/v26.1/protoc-26.1-linux-aarch_64.zip -o protoc.zip && \
unzip -j -d /usr/local/bin protoc.zip bin/protoc && \
rm protoc.zip
```

### Install golang

```bash
wget https://go.dev/dl/go1.22.3.linux-arm64.tar.gz
sudo tar -C /usr/local -xzf go1.22.3.linux-amd64.tar.gz
echo "export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin:/usr/local/cuda/bin" >> ~/.bashrc
source ~/.bashrc
```

## Install LocalAI

We are going to build LocalAI from source, as the prebuilt binaries are not available for the Jetson Nano and CUDA. The Jetson nano uses CUDA 10.2.

```bash
git clone https://github.com/mudler/LocalAI
cd LocalAI
BUILD_GRPC_FOR_BACKEND_LLAMA=true GRPC_BACKENDS="backend-assets/grpc/llama-cpp" BUILD_TYPE=cublas GO_TAGS=p2p make build
```

We are going to build only the llama-cpp backend (I did not try the others for now). 

Its going to take a while, grab a coffee and wait for the build to finish.

... and boom, it fails compiling ?!. 

At this point, you will need to patch few things out as llama.cpp with gcc 8 on aarch64 does not seem to compile see (upstream issue at https://github.com/ggerganov/llama.cpp/issues/7147 ) :

```
diff --git a/ggml-cuda/fattn-common.cuh b/ggml-cuda/fattn-common.cuh
index 1dd519bd..c363bc9f 100644
--- a/ggml-cuda/fattn-common.cuh
+++ b/ggml-cuda/fattn-common.cuh
@@ -52,7 +52,7 @@ static __global__ void flash_attn_combine_results(
     dst       +=                 D * gridDim.y*blockIdx.x;
 
     const int tid = threadIdx.x;
-    __builtin_assume(tid < D);
+    //__builtin_assume(tid < D);
 
     __shared__ float2 meta[parallel_blocks];
     if (tid < 2*parallel_blocks) {
diff --git a/ggml-cuda/fattn-vec-f16.cu b/ggml-cuda/fattn-vec-f16.cu
index 808e8f36..2bbb39bd 100644
--- a/ggml-cuda/fattn-vec-f16.cu
+++ b/ggml-cuda/fattn-vec-f16.cu
@@ -59,7 +59,7 @@ static __global__ void flash_attn_vec_ext_f16(
     static_assert(D % (2*WARP_SIZE) == 0, "D not divisible by 2*WARP_SIZE == 64.");
     constexpr int nwarps = D / WARP_SIZE;
     const int tid = WARP_SIZE*threadIdx.y + threadIdx.x;
-    __builtin_assume(tid < D);
+    //__assume(tid < D);
 
     __shared__ half KQ[ncols*D];
 #pragma unroll
diff --git a/ggml-cuda/fattn-vec-f32.cu b/ggml-cuda/fattn-vec-f32.cu
index b4652301..500239b8 100644
--- a/ggml-cuda/fattn-vec-f32.cu
+++ b/ggml-cuda/fattn-vec-f32.cu
@@ -57,7 +57,7 @@ static __global__ void flash_attn_vec_ext_f32(
     static_assert(D % (2*WARP_SIZE) == 0, "D not divisible by 2*WARP_SIZE == 64.");
     constexpr int nwarps = D / WARP_SIZE;
     const int tid = WARP_SIZE*threadIdx.y + threadIdx.x;
-    __builtin_assume(tid < D);
+//#__builtin_assume(tid < D);
 
     __shared__ float KQ[ncols*D];
 #pragma unroll
diff --git a/ggml-impl.h b/ggml-impl.h
index 5e77471f..1ad54af8 100644
--- a/ggml-impl.h
+++ b/ggml-impl.h
@@ -382,15 +382,15 @@ inline static uint8x16_t ggml_vqtbl1q_u8(uint8x16_t a, uint8x16_t b) {
 
 #define ggml_int16x8x2_t  int16x8x2_t
 #define ggml_uint8x16x2_t uint8x16x2_t
-#define ggml_uint8x16x4_t uint8x16x4_t
+#define ggml_uint8x16x4_t uint8x16x2_t
 #define ggml_int8x16x2_t  int8x16x2_t
-#define ggml_int8x16x4_t  int8x16x4_t
+#define ggml_int8x16x4_t  int8x16x2_t
 
 #define ggml_vld1q_s16_x2 vld1q_s16_x2
 #define ggml_vld1q_u8_x2  vld1q_u8_x2
-#define ggml_vld1q_u8_x4  vld1q_u8_x4
+#define ggml_vld1q_u8_x4  vld1q_u8_x2
 #define ggml_vld1q_s8_x2  vld1q_s8_x2
-#define ggml_vld1q_s8_x4  vld1q_s8_x4
+#define ggml_vld1q_s8_x4  vld1q_s8_x2
 #define ggml_vqtbl1q_s8   vqtbl1q_s8
 #define ggml_vqtbl1q_u8   vqtbl1q_u8
```

Apply the patch in `LocalAI/backend/cpp/llama-cpp/llama.cpp/ggml/src`.

## Result

Now you should have a binary, `local-ai`, and you can run phi-3 with:

```bash
./local-ai run https://gist.githubusercontent.com/mudler/86dbff5fdf46e993b81dd366a679ea32/raw/20e6416719e86f99954b8ea7a26b1aa680db6f59/phi-3-mini-jetson.yaml
```

Example output:
```
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: freq_base_train  = 10000.0
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: freq_scale_train = 1
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: n_yarn_orig_ctx  = 2048
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: rope_finetuned   = unknown
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: ssm_d_conv       = 0
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: ssm_d_inner      = 0
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: ssm_d_state      = 0
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: ssm_dt_rank      = 0
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: model type       = 3B
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: model ftype      = Q4_K - Medium
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: model params     = 2.78 B
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: model size       = 1.62 GiB (5.00 BPW)
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: general.name     = Phi2
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: BOS token        = 50256 '<|endoftext|>'
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: EOS token        = 50256 '<|endoftext|>'
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: UNK token        = 50256 '<|endoftext|>'
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: PAD token        = 50256 '<|endoftext|>'
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: LF token         = 128 'Ä'
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_print_meta: EOT token        = 50256 '<|endoftext|>'
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr ggml_cuda_init: GGML_CUDA_FORCE_MMQ:   no
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr ggml_cuda_init: CUDA_USE_TENSOR_CORES: yes
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr ggml_cuda_init: found 1 CUDA devices:
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr   Device 0: NVIDIA Tegra X1, compute capability 5.3, VMM: no
6:43PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_tensors: ggml ctx size =    0.42 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_tensors: offloading 32 repeating layers to GPU
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_tensors: offloading non-repeating layers to GPU
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_tensors: offloaded 33/33 layers to GPU
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_tensors:        CPU buffer size =    70.31 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llm_load_tensors:      CUDA0 buffer size =  1585.10 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr ..........................................................................................
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: n_ctx      = 4096
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: n_batch    = 512
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: n_ubatch   = 512
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: flash_attn = 0
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: freq_base  = 10000.0
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: freq_scale = 1
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_kv_cache_init:      CUDA0 KV buffer size =  1280.00 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: KV self size  = 1280.00 MiB, K (f16):  640.00 MiB, V (f16):  640.00 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model:  CUDA_Host  output buffer size =     0.20 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model:      CUDA0 compute buffer size =   284.00 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model:  CUDA_Host compute buffer size =    13.01 MiB
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: graph nodes  = 1161
6:45PM DBG GRPC(phi-2-layla-v1-chatml-Q4_K.gguf-127.0.0.1:40757): stderr llama_new_context_with_model: graph splits = 2
```
