import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class ProductsAppLayersStack extends cdk.Stack {
  readonly productsLayers: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.productsLayers = new lambda.LayerVersion(this, "ProductsLayers", {
      code: lambda.Code.fromAsset("lambda/products/layers/productsLayer"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      layerVersionName: "ProductsLayers",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    new ssm.StringParameter(this, "ProductsLayersVersionArn", {
      parameterName: "ProductsLayersVersionArn",
      stringValue: this.productsLayers.layerVersionArn,
    });
  }
}
