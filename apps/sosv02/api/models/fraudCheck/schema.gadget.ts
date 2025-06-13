import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "fraudCheck" model, go to https://sosv02.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "W3huSVr77xvN",
  fields: {
    checkResults: { type: "json", storageKey: "7Esso0tMK9zu" },
    checkedAt: {
      type: "dateTime",
      includeTime: true,
      default: "2025-06-12T00:00:00.000Z",
      storageKey: "bivaFi4PEHvt",
    },
    email: { type: "string", storageKey: "hfv7K0pcD_Zk" },
    flaggedReasons: {
      type: "json",
      default: [],
      storageKey: "iuMzxX5kFzdg",
    },
    ipAddress: { type: "string", storageKey: "m6FqjzQgcSA0" },
    orderId: {
      type: "string",
      validations: { required: true },
      storageKey: "qmyH6wXg2X99",
    },
    phone: { type: "string", storageKey: "SWRM2Dm_ZTh3" },
    riskScore: {
      type: "number",
      default: 0,
      storageKey: "dMv9S2QdbYw4",
    },
    shopDomain: {
      type: "string",
      validations: { required: true },
      storageKey: "uzeMgEczEiwn",
    },
    status: {
      type: "string",
      default: "pending",
      storageKey: "DoZF4Eo-jiko",
    },
  },
};
