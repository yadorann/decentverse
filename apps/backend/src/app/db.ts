import { Types, FilterQuery } from "mongoose";
export type ID = Types.ObjectId;
export const ObjectId = Types.ObjectId;
export { FilterQuery as Query };
export * as Template from "./_template/_template.model";
