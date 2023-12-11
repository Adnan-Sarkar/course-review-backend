import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponseData<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: TMeta;
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  const resObj: TResponseData<T> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    meta: data.meta,
    data: data.data,
  };

  // if meta is not availabe then remove it from response
  if (!data.meta) {
    delete resObj.meta;
  }

  res.status(data.statusCode).json(resObj);
};

export default sendResponse;
