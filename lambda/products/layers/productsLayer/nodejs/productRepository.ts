import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuidv4 } from "uuid";

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
}

export class ProductRepository {
  private ddbClient: DocumentClient;
  private productsDdb: string;

  constructor(ddbClient: DocumentClient, productsDdb: string) {
    this.ddbClient = ddbClient;
    this.productsDdb = productsDdb;
  }

  getAllProducts = async (): Promise<Product[]> => {
    const params = {
      TableName: this.productsDdb,
    };
    const result = await this.ddbClient.scan(params).promise();
    return result.Items as Product[];
  };

  getProductById = async (id: string): Promise<Product> => {
    const params = {
      TableName: this.productsDdb,
      Key: {
        id,
      },
    };
    const result = await this.ddbClient.get(params).promise();
    if (result.Item) {
      return result.Item as Product;
    } else {
      throw new Error("Product not found");
    }
  };

  createProduct = async (product: Product): Promise<Product> => {
    const params = {
      TableName: this.productsDdb,
      Item: {
        ...product,
        id: uuidv4(),
      },
    };
    await this.ddbClient.put(params).promise();
    return params.Item as Product;
  };

  deleteProduct = async (id: string): Promise<Product> => {
    const data = await this.ddbClient
      .delete({
        TableName: this.productsDdb,
        Key: {
          id,
        },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    if (data.Attributes) {
      return data.Attributes as Product;
    } else {
      throw new Error("Product not found");
    }
  };

  updateProduct = async (
    productId: string,
    product: Product
  ): Promise<Product> => {
    const data = await this.ddbClient
      .update({
        TableName: this.productsDdb,
        Key: {
          id: productId,
        },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "UPDATED_NEW",
        UpdateExpression:
          "set productName = :n, code = :c, price = :p, model = :m",
        ExpressionAttributeValues: {
          ":n": product.productName,
          ":c": product.code,
          ":p": product.price,
          ":m": product.model,
        },
      })
      .promise();

    data.Attributes!.id = productId;
    return data.Attributes as Product;
  };
}
