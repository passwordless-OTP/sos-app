import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyBusinessEntity" model, go to https://sosv02.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-BusinessEntity",
  fields: {},
  shopify: {
    fields: [
      "address",
      "companyName",
      "displayName",
      "primary",
      "shop",
    ],
  },
};
