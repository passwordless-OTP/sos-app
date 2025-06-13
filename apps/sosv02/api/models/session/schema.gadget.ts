import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://sosv02.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "uH6z-Mesoi2Q",
  fields: {
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "f82x7-b82ERa",
    },
  },
  shopify: { fields: ["shop", "shopifySID"] },
};
