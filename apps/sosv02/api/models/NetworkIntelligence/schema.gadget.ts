import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "NetworkIntelligence" model, go to https://sosv02.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "QjTkbzlczoZq",
  fields: {
    details: {
      type: "json",
      default: {},
      storageKey: "vZuRKMZtu4Cy",
    },
    identfierType: {
      type: "string",
      validations: { required: true },
      storageKey: "T6lpghxWxKHD",
    },
    identifier: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "JMkdgNIH2H-E",
    },
    lastReportedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "1KqRtvaPDEZF",
    },
    reportCount: {
      type: "number",
      default: 0,
      storageKey: "XtnSBP3iYNNy",
    },
    reportedBy: {
      type: "json",
      default: [],
      storageKey: "wlz11eh5W1kb",
    },
    riskLevel: {
      type: "number",
      default: 0,
      storageKey: "G4-2vdP2NCyp",
    },
  },
};
