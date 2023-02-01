import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { ProductRepository } from "opt/nodejs/productsLayer";
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
  const method = event.httpMethod;

  console.log(
    `API Gateway RequestID ${apiRequestId}: - Lambda RequestID ${lambdaRequestId}`
  );

  if (event.resource === "/products") {
    if (method === "GET") {
      console.log("GET");

      const products = await productRepository.getAllProducts();

      return {
        statusCode: 200,
        body: JSON.stringify(products),
      };
    }
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;
    if (method === "GET") {
      console.log(`GET /products/${productId}`);

      try {
        const product = await productRepository.getProductById(productId);
        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      } catch (error) {
        console.log((<Error>error).message);
        return {
          statusCode: 200,
          body: (<Error>error).message,
        };
      }
    }
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Not Found",
      }),
    };
  }
}
