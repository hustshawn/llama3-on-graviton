import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

export interface LlamaInstanceProps {
  vpc: ec2.IVpc;
}

export class LlamaInstance extends Construct {
  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: LlamaInstanceProps) {
    super(scope, id);

    // Create IAM role for the instance
    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // User data script to set up Llama
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'apt-get update',
      'apt-get install -y make cmake gcc g++ build-essential python-is-python3 python3-pip python3-venv git',

      // // Create working directory
      // 'mkdir -p /opt/llama',
      // 'cd /opt/llama',

      // // Clone and build llama.cpp
      // 'git clone https://github.com/ggerganov/llama.cpp',
      // 'cd llama.cpp',
      // 'make GGML_NO_LLAMAFILE=1 -j$(nproc)',

      // // Set up Python environment
      // 'python -m venv venv',
      // 'source venv/bin/activate',
      // 'pip install huggingface_hub',

      // // Download the model
      // 'huggingface-cli download cognitivecomputations/dolphin-2.9.4-llama3.1-8b-gguf dolphin-2.9.4-llama3.1-8b-Q4_0.gguf --local-dir . --local-dir-use-symlinks False',

      // // Requantize for Graviton3
      // './llama-quantize --allow-requantize dolphin-2.9.4-llama3.1-8b-Q4_0.gguf dolphin-2.9.4-llama3.1-8b-Q4_0_8_8.gguf Q4_0_8_8'
    );

    // Create security group
    const securityGroup = new ec2.SecurityGroup(this, 'LlamaSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Llama instance',
      allowAllOutbound: true,
    });

    // Create the EC2 instance
    this.instance = new ec2.Instance(this, 'LlamaInstance', {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.C7G, ec2.InstanceSize.XLARGE16),
      machineImage: ec2.MachineImage.fromSsmParameter(
        '/aws/service/canonical/ubuntu/server/22.04/stable/current/arm64/hvm/ebs-gp2/ami-id'
      ),
      userData: userData,
      role: role,
      securityGroup: securityGroup,
      blockDevices: [{
        deviceName: '/dev/sda1',
        volume: ec2.BlockDeviceVolume.ebs(100),
      }],
    });

    // Add outputs
    new cdk.CfnOutput(this, 'InstancePublicIP', {
      value: this.instance.instancePublicIp,
      description: 'Public IP address of the EC2 instance',
    });

    new cdk.CfnOutput(this, 'InstanceId', {
      value: this.instance.instanceId,
      description: 'ID of the EC2 instance',
    });

    // output the Private IP DNS name
    new cdk.CfnOutput(this, 'InstancePrivateDNS', {
      value: this.instance.instancePrivateDnsName,
      description: 'Private IP DNS name of the EC2 instance',
    });
  }
} 