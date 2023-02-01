import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

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

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "GET Products - OK",
        }),
      };
    }
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed",
      }),
    };
  } else if (event.resource === "/products/{id}") {
    if (method === "GET") {
      console.log("GET");

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "GET Product - OK",
        }),
      };
    }
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed",
      }),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Not Found",
      }),
    };
  }
}
