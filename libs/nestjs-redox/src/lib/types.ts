// source: https://github.com/Redocly/redoc/blob/main/docs/config.md

export interface RedocOptions {
  /**
   * Disables search indexing and hides the search box from the API documentation page.
   */
  disableSearch?: boolean;
  /**
   * Sets the minimum amount of characters that need to be typed into the search dialog to initiate the search.
   */
  minCharacterLengthToInitSearch?: number;
  /**
   * Enables or disables expanding default server variables.
   */
  expandDefaultServerVariables?: boolean;
  /**
   * Controls which responses to expand by default. Specify one or more responses by providing their response codes as a comma-separated list without spaces, for example expandResponses='200,201'. Special value 'all' expands all responses by default. Be careful: this option can slow down documentation rendering time.
   */
  expandResponses?: boolean;
  /**
   * Automatically expands the single field in a schema.
   */
  expandSingleSchemaField?: boolean;
  /**
   * Hides the 'Download' button for saving the API definition source file. This setting does not make the API definition private; it just hides the button.
   */
  hideDownloadButton?: boolean;
  /**
   * If set to true, the protocol and hostname are not shown in the operation definition.
   */
  hideHostname?: boolean;
  /**
   * Hides the loading animation. Does not apply to CLI or Workflows-rendered docs.
   */
  hideLoading?: boolean;
  /**
   * Hides request payload examples.
   */
  hideRequestPayloadSample?: boolean;
  /**
   * If set to true, the description for oneOf/anyOf object is not shown in the schema.
   */
  hideOneOfDescription?: boolean;
  /**
   * If set to true, the pattern is not shown in the schema.
   */
  hideSchemaPattern?: boolean;
  /**
   * Hides the schema title next to to the type.
   */
  hideSchemaTitles?: boolean;
  /**
   * Hides the Security panel section.
   */
  hideSecuritySection?: boolean;
  /**
   *   Hides the request sample tab for requests with only one sample.
   */
  hideSingleRequestSampleTab?: boolean;
  /**
   * Sets the path to the optional HTML file used to modify the layout of the reference docs page.
   */
  htmlTemplate?: string;
  /**
   * Sets the default expand level for JSON payload samples (response and request body). The default value is 2, and the maximum supported value is '+Infinity'. It can also be configured as a string with the special value all that expands all levels.
   */
  jsonSampleExpandLevel?: number;
  /**
   * Displays only the specified number of enum values. The remaining values are hidden in an expandable area. If not set, all values are displayed.
   */
  maxDisplayedEnumValues?: number;
  /**
   * If set to true, selecting an expanded item in the sidebar twice collapses it. Default true.
   */
  menuToggle?: boolean;
  /**
   * If set to true, the sidebar uses the native scrollbar instead of perfect-scroll. This setting is a scrolling performance optimization for big API definitions.
   */
  nativeScrollbars?: boolean;
  /**
   * Shows only required fields in request samples.
   */
  onlyRequiredInSamples?: boolean;
  /**
   * Shows the path link and HTTP verb in the middle panel instead of the right panel.
   */
  pathInMiddlePanel?: boolean;
  /**
   * If set, the payload sample is inserted at the specified index. If there are N payload samples and the value configured here is bigger than N, the payload sample is inserted last. Indexes start from 0.
   */
  payloadSampleIdx?: number;
  /**
   * Shows required properties in schemas first, ordered in the same order as in the required array.
   */
  requiredPropsFirst?: boolean;
  /**
   * Specifies whether to automatically expand schemas in Reference docs. Set it to all to expand all schemas regardless of their level, or set it to a number to expand schemas up to the specified level. For example, schemaExpansionLevel: 3 expands schemas up to three levels deep. The default value is 0, meaning no schemas are expanded automatically.
   */
  schemaExpansionLevel?: number;
  /**
   * Specifies a vertical scroll-offset. This setting is useful when there are fixed positioned elements at the top of the page, such as navbars, headers, etc.
   *
   *   Note that you can specify the scrollYOffset value in any of the following ways:
   *
   *   as a number - a fixed number of pixels to be used as the offset.
   *   as a CSS selector - the selector of the element to be used for specifying the offset. The distance from the top of the page to the element's bottom is used as the offset.
   *   a function (advanced) - a getter function. Must return a number representing the offset (in pixels).
   */
  scrollYOffset?: number;
  /**
   * Shows specification extensions ('x-' fields). Extensions used by Redoc are ignored. The value can be boolean or an array of strings with names of extensions to display. When used as boolean and set to true, all specification extensions are shown.
   */
  showExtensions?: boolean;
  /**
   * Shows object schema example in the properties; default false.
   */
  showObjectSchemaExamples?: boolean;
  /**
   * When set to true, shows the HTTP request method for webhooks in operations and in the sidebar.
   */
  showWebhookVerb?: boolean;
  /**
   * Shows only unique oneOf types in the label without titles.
   */
  simpleOneOfTypeLabel?: boolean;
  /**
   *   When set to true, sorts all enum values in all schemas alphabetically.
   */
  sortEnumValuesAlphabetically?: boolean;
  /**
   * When set to true, sorts operations in the navigation sidebar and in the middle panel alphabetically.
   */
  sortOperationsAlphabetically?: boolean;
  /**
   * When set to true, sorts properties in all schemas alphabetically.
   */
  sortPropsAlphabetically?: boolean;
  /**
   * When set to true, sorts tags in the navigation sidebar and in the middle panel alphabetically. Note that only tags are sorted alphabetically in the middle panel, not the operations associated with each tag. To sort operations alphabetically as well, you must set the sortOperationsAlphabetically setting to true
   * @default true
   */
  sortTagsAlphabetically?: boolean;
  /**
   * If set to true, the API definition is considered untrusted and all HTML/Markdown is sanitized to prevent XSS.
   */
  untrustedDefinition?: boolean;
  /**
   * Group tags by categories in the side menu
   */
  tagGroups?: {
    name: string;
    tags: string[];
  }[];
  /**
   * is used to specify API logo
   */
  logo?: {
    url?: string;
    backgroundColor?: string;
    altText?: string;
    href?: string;
  };
  /**
   * In Swagger two operations can have multiple tags. This property distinguishes between tags that are used to group operations (default) from tags that are used to mark operation with certain trait (true value)
   */
  traitTag?: boolean;
  /**
   * A list of code samples associated with operation
   */
  codeSamples?: {
    lang: string;
    label: string;
    source: string;
  }[];

  /**
   * Object that contains examples for the request. Applies when in is body and mime-type is application/json
   */
  examples?: any;
}

export class NestJSRedoxOptions {
  // served path on that the redoc is available
  useGlobalPrefix?: boolean = false;
  disableGoogleFont?: boolean = false;
  auth?: {
    enabled?: boolean;
    users: Record<string, string>;
  };

  /**
   * Enable this if you want to serve your own redoc installation. You have to install redoc as dependency.
   * @default: false
   */
  standalone?: boolean = false;

  constructor(partial?: Partial<NestJSRedoxOptions>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
