import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Product, ProductRepository } from "opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";

const productDdb = process.env.PRODUCTS_DDB! as string;
const ddbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(ddbClient, productDdb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(
    `API Gateway RequestID ${apiRequestId}: - Lambda RequestID ${lambdaRequestId}`
  );

  if (event.resource === "/products") {
    console.log("POST /products");
    const product = JSON.parse(event.body!) as Product;

    const productCreated = await productRepository.createProduct(product);
    return {
      statusCode: 201,
      body: JSON.stringify(productCreated),
    };
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;
    if (event.httpMethod === "PUT") {
      console.log(`PUT /products/${productId}`);

      try {
        const product = JSON.parse(event.body!) as Product;
        const productUpdated = await productRepository.updateProduct(
          productId,
          product
        );

        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated),
        };
      } catch (ConditionCheckFailedException) {
        return {
          statusCode: 404,
          body: "Product not found",
        };
      }
    } else if (event.httpMethod === "DELETE") {
      console.log(`DELETE /products/${productId}`);
      try {
        const product = await productRepository.deleteProduct(productId);
        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      } catch (error) {
        return {
          statusCode: 404,
          body: (<Error>error).message,
        };
      }
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Bad request",
      }),
    };
  }
}
