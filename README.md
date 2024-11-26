# Llama 3 Performance Testing on AWS Graviton

This repository contains infrastructure code and benchmarking results for testing the Llama 3 model deployment on ARM-based AWS Graviton instances.

## Overview

This project aims to evaluate the performance of running Llama 3 language models on AWS Graviton processors, providing insights into ARM-based ML inference workloads. The infrastructure is implemented using AWS CDK (Cloud Development Kit) for reproducible deployments.

## Repository Structure

```text
.
├── cdk/                    # AWS CDK Infrastructure code
│   ├── lib/               # Main stack and construct definitions
│   │   ├── cdk-stack.ts   # Main stack configuration
│   │   └── constructs/    # Custom constructs including EC2 setup
│   ├── bin/               # CDK app entry point
│   └── test/              # Infrastructure tests
└── tests/                 # Benchmarking results
    └── gv3-c7g-16xlarge/ # Results for c7g.16xlarge instance type
        ├── q4-088.md     # Quantized model (Q4) specific test results
        └── q4.md         # General Q4 benchmarking data
```

## Infrastructure Details

### EC2 Instance Configuration

The infrastructure code provisions AWS Graviton-based EC2 instances with the following specifications:

- Instance Type: c7g.16xlarge (ARM-based)
- Architecture: 64-bit ARM
- vCPUs: 64
- Memory: 128 GB

### CDK Stack Features

- Automated EC2 instance provisioning
- Security group configuration for secure access
- IAM role setup with necessary permissions
- VPC and networking configuration

## Model Quantization

The testing involves different quantization methods optimized for Graviton processors. The quantization format is denoted as follows:

| Component | Description |
|-----------|-------------|
| Q4_0 | 4-bit integer quantization with straightforward method |
| Q4_0_8_8 | Optimized for Graviton3 with SVE 256 and MATMUL INT8 support |
| Q4_0_4_4 | Optimal format for Graviton2 |
| Q4_0_4_8 | Optimal format for Graviton4 |

The quantization method significantly impacts model performance:

- Reduces model size (from FP16/FP32 to 4-bit integers)
- Improves memory efficiency
- Optimizes for specific Graviton processor features (NEON, SVE, MATMUL_INT8)

[Source: Arm Developer Documentation](https://learn.arm.com/learning-paths/servers-and-cloud-computing/llama-cpu/llama-chatbot/)

## Benchmarking Results

### Model Variants Tested

- Q4_0_8_8 quantized model with Graviton3 optimizations
- Performance comparisons between different quantization methods

### Key Metrics

The benchmarking results include:

- Inference latency
- Memory utilization
- CPU usage patterns
- Model loading times
- Prompt evaluation performance

Detailed results can be found in:

- `tests/gv3-c7g-16xlarge/q4.md` for general Q4 model results
- `tests/gv3-c7g-16xlarge/q4-088.md` for specific Q4_088 model results
