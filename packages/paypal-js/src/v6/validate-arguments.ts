import { getOwnProperty } from "../utils";
import type { LoadCoreSdkScriptOptions } from "../../types/v6/index";

export function validateArguments(options: unknown) {
  if (typeof options !== "object" || options === null) {
    throw new Error("Expected an options object");
  }
  // Use getOwnProperty to avoid picking up prototype-polluted values.
  const guardedOptions = options as LoadCoreSdkScriptOptions;
  const environment = getOwnProperty(guardedOptions, "environment");
  const dataNamespace = getOwnProperty(guardedOptions, "dataNamespace");
  const dataSdkIntegrationSource = getOwnProperty(
    guardedOptions,
    "dataSdkIntegrationSource",
  );

  if (environment !== "production" && environment !== "sandbox") {
    throw new Error(
      'The "environment" option is required and must be either "production" or "sandbox"',
    );
  }

  if (dataNamespace !== undefined && dataNamespace.trim() === "") {
    throw new Error('The "dataNamespace" option cannot be an empty string');
  }

  if (
    dataSdkIntegrationSource !== undefined &&
    dataSdkIntegrationSource.trim() === ""
  ) {
    throw new Error(
      'The "dataSdkIntegrationSource" option cannot be an empty string',
    );
  }
}
