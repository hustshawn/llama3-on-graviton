import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CdkStack } from '../lib/cdk-stack';

describe('CdkStack', () => {
  let stack: CdkStack;
  let template: Template;

  beforeEach(() => {
    const app = new cdk.App();

    stack = new CdkStack(app, 'TestStack', {
      env: { account: '985955614379', region: 'ap-southeast-1' },
    });
    template = Template.fromStack(stack);
  });

  test('EC2 instance created with correct configuration', () => {
    // Verify EC2 instance exists
    template.hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 'c7g.16xlarge',
      ImageId: Match.anyValue(),
      SubnetId: Match.anyValue(),
      SecurityGroupIds: Match.anyValue(),
    });

    // Verify IAM role with SSM policy exists
    template.hasResourceProperties('AWS::IAM::Role', {
      ManagedPolicyArns: Match.arrayWith([
        Match.objectLike({
          'Fn::Join': ['', Match.arrayWith([
            Match.stringLikeRegexp('.*AmazonSSMManagedInstanceCore')
          ])]
        })
      ])
    });

    // Verify the outputs exist
    template.hasOutput('*', Match.objectLike({
      Description: 'Public IP address of the EC2 instance',
      Value: Match.anyValue()
    }));

    template.hasOutput('*', Match.objectLike({
      Description: 'ID of the EC2 instance',
      Value: Match.anyValue()
    }));
  });

  test('Resource count is correct', () => {
    // Count the number of resources of each type
    template.resourceCountIs('AWS::EC2::Instance', 1);
    template.resourceCountIs('AWS::IAM::Role', 1);
    template.resourceCountIs('AWS::IAM::InstanceProfile', 1);
  });
});
