import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shop" model, go to https://sosv02.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "7woprjyk9RDp",
  fields: {
    InstalledAt: {
      type: "dateTime",
      includeTime: true,
      default: "2025-06-12T00:00:00.000Z",
      storageKey: "A4HX6v-Uo4IH",
    },
    accessToken: {
      type: "encryptedString",
      storageKey: "3trRKIaIPDpd::String-3trRKIaIPDpd",
    },
    domain: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "JcEhvm4EhOpZ",
    },
    settings: {
      type: "json",
      default: {
        autoCheckOrders: true,
        riskThreshold: 70,
        notificationEmail: null,
      },
      storageKey: "mPq6DPBy0Y51",
    },
  },
};
