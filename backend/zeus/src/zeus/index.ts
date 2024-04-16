/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";
export const HOST = "http://localhost:8112/v1/graphql";

export const HEADERS = {};
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + "?query=" + encodeURIComponent(query);
    const wsString = queryString.replace("http", "ws");
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error("No websockets implemented");
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === "GET") {
      return fetch(
        `${options[0]}?query=${encodeURIComponent(query)}`,
        fetchOptions,
      )
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = "",
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return "";
    }
    if (typeof o === "boolean" || typeof o === "number") {
      return k;
    }
    if (typeof o === "string") {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}",
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join("\n");
    }
    const hasOperationName =
      root && options?.operationName ? " " + options.operationName : "";
    const keyForDirectives = o.__directives ?? "";
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map((e) =>
        ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars),
      )
      .join("\n")}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars
      .map((v) => `${v.name}: ${v.graphQLType}`)
      .join(", ");
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ""} ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>,
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>,
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
  ) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (
        fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void,
      ) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) =>
  SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: (Z & ValueTypes[R]) | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    "Content-Type": "application/json",
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(
    initialOp as string,
    ops[initialOp],
    initialZeusQuery,
  );
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(
      initialOp as string,
      response,
      [ops[initialOp]],
    );
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p: string[] = [],
  ): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder =
        resolvers[currentScalarString.split(".")[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string" ||
      !o
    ) {
      return o;
    }
    const entries = Object.entries(o).map(
      ([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const,
    );
    const objectFromEntries = entries.reduce<Record<string, unknown>>(
      (a, [k, v]) => {
        a[k] = v;
        return a;
      },
      {},
    );
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | "enum"
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]:
    | undefined
    | boolean
    | string
    | number
    | [any, undefined | boolean | InputValueType]
    | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = "|";

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (
  ...args: infer R
) => WebSocket
  ? R
  : never;
export type chainOptions =
  | [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }]
  | [fetchOptions[0]];
export type FetchFunction = (
  query: string,
  variables?: Record<string, unknown>,
) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<
  F extends [infer ARGS, any] ? ARGS : undefined
>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super("");
    console.error(response);
  }
  toString() {
    return "GraphQL Response Error";
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops
  ? (typeof Ops)[O]
  : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (
  mappedParts: string[],
  returns: ReturnTypesType,
): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === "object") {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({
  ops,
  returns,
}: {
  returns: ReturnTypesType;
  ops: Operations;
}) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string"
    ) {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith("scalar")) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}",
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment
            ? pOriginals
            : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) =>
  k.replace(/\([^)]*\)/g, "").replace(/^[^:]*\:/g, "");

const mapPart = (p: string) => {
  const [isArg, isField] = p.split("<>");
  if (isField) {
    return {
      v: isField,
      __type: "field",
    } as const;
  }
  return {
    v: isArg,
    __type: "arg",
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (
  props: AllTypesPropsType,
  returns: ReturnTypesType,
  ops: Operations,
) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === "enum" && mappedParts.length === 1) {
      return "enum";
    }
    if (
      typeof propsP1 === "string" &&
      propsP1.startsWith("scalar.") &&
      mappedParts.length === 1
    ) {
      return propsP1;
    }
    if (typeof propsP1 === "object") {
      if (mappedParts.length < 2) {
        return "not";
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === "string") {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === "object") {
        if (mappedParts.length < 3) {
          return "not";
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === "arg") {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return "not";
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === "object") {
      if (mappedParts.length < 2) return "not";
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): "enum" | "not" | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return "not";
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = "", root = true): string => {
    if (typeof a === "string") {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a
          .replace(START_VAR_NAME, "$")
          .split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith("scalar.")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split(".");
      const scalarKey = splittedScalar.join(".");
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(", ")}]`;
    }
    if (typeof a === "string") {
      if (checkType === "enum") {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === "object") {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== "undefined")
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(",\n");
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <
  X,
  T extends keyof ResolverInputTypes,
  Z extends keyof ResolverInputTypes[T],
>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any]
      ? Input
      : any,
    source: any,
  ) => Z extends keyof ModelTypes[T]
    ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X
    : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>;
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends "scalar" & {
  name: infer T;
}
  ? T extends keyof SCLR
    ? SCLR[T]["decode"] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]["decode"]>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> =
  T extends Array<infer R> ? InputType<R, U, SCLR>[] : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<
  SRC extends DeepAnify<DST>,
  DST,
  SCLR extends ScalarDefinition,
> =
  FlattenArray<SRC> extends ZEUS_INTERFACES | ZEUS_UNIONS
    ? {
        [P in keyof SRC]: SRC[P] extends "__union" & infer R
          ? P extends keyof DST
            ? IsArray<
                R,
                "__typename" extends keyof DST
                  ? DST[P] & { __typename: true }
                  : DST[P],
                SCLR
              >
            : IsArray<
                R,
                "__typename" extends keyof DST
                  ? { __typename: true }
                  : Record<string, never>,
                SCLR
              >
          : never;
      }[keyof SRC] & {
        [P in keyof Omit<
          Pick<
            SRC,
            {
              [P in keyof DST]: SRC[P] extends "__union" & infer R ? never : P;
            }[keyof DST]
          >,
          "__typename"
        >]: IsPayLoad<DST[P]> extends BaseZeusResolver
          ? IsScalar<SRC[P], SCLR>
          : IsArray<SRC[P], DST[P], SCLR>;
      }
    : {
        [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<
          DST[P]
        > extends BaseZeusResolver
          ? IsScalar<SRC[P], SCLR>
          : IsArray<SRC[P], DST[P], SCLR>;
      };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> =
  SRC extends DeepAnify<DST> ? IsInterfaced<SRC, DST, SCLR> : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> =
  IsPayLoad<DST> extends { __alias: infer R }
    ? {
        [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<
          SRC,
          R[P],
          SCLR
        >];
      } & MapType<SRC, Omit<IsPayLoad<DST>, "__alias">, SCLR>
    : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (
    fn: (e: {
      data?: InputType<T, Z, SCLR>;
      code?: number;
      reason?: string;
      message?: string;
    }) => void,
  ) => void;
  error: (
    fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void,
  ) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<
  SELECTOR,
  NAME extends keyof GraphQLTypes,
  SCLR extends ScalarDefinition = {},
> = InputType<GraphQLTypes[NAME], SELECTOR, SCLR>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ["String"]: string;
  ["Int"]: number;
  ["Float"]: number;
  ["ID"]: unknown;
  ["Boolean"]: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> =
  | `${T}!`
  | T
  | `[${T}]`
  | `[${T}]!`
  | `[${T}!]`
  | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> =
  T extends VR<infer R1>
    ? R1 extends VR<infer R2>
      ? R2 extends VR<infer R3>
        ? R3 extends VR<infer R4>
          ? R4 extends VR<infer R5>
            ? R5
            : R4
          : R3
        : R2
      : R1
    : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
    ? NonNullable<DecomposeType<R, Type>>
    : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> =
  T extends keyof ZEUS_VARIABLES
    ? ZEUS_VARIABLES[T]
    : T extends keyof BuiltInVariableTypes
      ? BuiltInVariableTypes[T]
      : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> &
  WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  " __zeus_name": Name;
  " __zeus_type": T;
};

export type ExtractVariablesDeep<Query> =
  Query extends Variable<infer VType, infer VName>
    ? { [key in VName]: GetVariableType<VType> }
    : Query extends string | number | boolean | Array<string | number | boolean>
      ? // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      : UnionToIntersection<
          {
            [K in keyof Query]: WithOptionalNullables<
              ExtractVariablesDeep<Query[K]>
            >;
          }[keyof Query]
        >;

export type ExtractVariables<Query> =
  Query extends Variable<infer VType, infer VName>
    ? { [key in VName]: GetVariableType<VType> }
    : Query extends [infer Inputs, infer Outputs]
      ? ExtractVariablesDeep<Inputs> & ExtractVariables<Outputs>
      : Query extends
            | string
            | number
            | boolean
            | Array<string | number | boolean>
        ? // eslint-disable-next-line @typescript-eslint/ban-types
          {}
        : UnionToIntersection<
            {
              [K in keyof Query]: WithOptionalNullables<
                ExtractVariables<Query[K]>
              >;
            }[keyof Query]
          >;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(
  name: Name,
  graphqlType: Type,
) => {
  return (START_VAR_NAME +
    name +
    GRAPHQL_TYPE_SEPARATOR +
    graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never;
export type ScalarCoders = {
  timestamptz?: ScalarResolver;
  uuid?: ScalarResolver;
};
type ZEUS_UNIONS = never;

export type ValueTypes = {
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined | null | Variable<any, string>;
    _gt?: number | undefined | null | Variable<any, string>;
    _gte?: number | undefined | null | Variable<any, string>;
    _in?: Array<number> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: number | undefined | null | Variable<any, string>;
    _lte?: number | undefined | null | Variable<any, string>;
    _neq?: number | undefined | null | Variable<any, string>;
    _nin?: Array<number> | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined | null | Variable<any, string>;
    _gt?: string | undefined | null | Variable<any, string>;
    _gte?: string | undefined | null | Variable<any, string>;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined | null | Variable<any, string>;
    _in?: Array<string> | undefined | null | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    /** does the column match the given pattern */
    _like?: string | undefined | null | Variable<any, string>;
    _lt?: string | undefined | null | Variable<any, string>;
    _lte?: string | undefined | null | Variable<any, string>;
    _neq?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined | null | Variable<any, string>;
    _nin?: Array<string> | undefined | null | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined | null | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined | null | Variable<any, string>;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined | null | Variable<any, string>;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** game table */
  ["game"]: AliasType<{
    /** An object relationship */
    black_player?: ValueTypes["user"];
    black_player_id?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    moves?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["moves_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["moves_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["moves_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    moves_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["moves_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["moves_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["moves_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves_aggregate"],
    ];
    status?: boolean | `@${string}`;
    /** An object relationship */
    white_player?: ValueTypes["user"];
    white_player_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "game" */
  ["game_aggregate"]: AliasType<{
    aggregate?: ValueTypes["game_aggregate_fields"];
    nodes?: ValueTypes["game"];
    __typename?: boolean | `@${string}`;
  }>;
  ["game_aggregate_bool_exp"]: {
    count?:
      | ValueTypes["game_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["game_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["game_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["game_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
  /** aggregate fields of "game" */
  ["game_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["game_max_fields"];
    min?: ValueTypes["game_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "game" */
  ["game_aggregate_order_by"]: {
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["game_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["game_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "game" */
  ["game_arr_rel_insert_input"]: {
    data: Array<ValueTypes["game_insert_input"]> | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["game_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "game". All fields are combined with a logical 'AND'. */
  ["game_bool_exp"]: {
    _and?:
      | Array<ValueTypes["game_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["game_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["game_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    black_player?:
      | ValueTypes["user_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    black_player_id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    moves?:
      | ValueTypes["moves_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    moves_aggregate?:
      | ValueTypes["moves_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    status?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    white_player?:
      | ValueTypes["user_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    white_player_id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "game" */
  ["game_constraint"]: game_constraint;
  /** input type for inserting data into table "game" */
  ["game_insert_input"]: {
    black_player?:
      | ValueTypes["user_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    black_player_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    moves?:
      | ValueTypes["moves_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    white_player?:
      | ValueTypes["user_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    white_player_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["game_max_fields"]: AliasType<{
    black_player_id?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    white_player_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "game" */
  ["game_max_order_by"]: {
    black_player_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    status?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    white_player_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["game_min_fields"]: AliasType<{
    black_player_id?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    white_player_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "game" */
  ["game_min_order_by"]: {
    black_player_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    status?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    white_player_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "game" */
  ["game_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["game"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "game" */
  ["game_obj_rel_insert_input"]: {
    data: ValueTypes["game_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["game_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "game" */
  ["game_on_conflict"]: {
    constraint: ValueTypes["game_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["game_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["game_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "game". */
  ["game_order_by"]: {
    black_player?:
      | ValueTypes["user_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    black_player_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    moves_aggregate?:
      | ValueTypes["moves_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    status?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    white_player?:
      | ValueTypes["user_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    white_player_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: game */
  ["game_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "game" */
  ["game_select_column"]: game_select_column;
  /** input type for updating data in table "game" */
  ["game_set_input"]: {
    black_player_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    white_player_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "game" */
  ["game_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["game_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["game_stream_cursor_value_input"]: {
    black_player_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    white_player_id?:
      | ValueTypes["uuid"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "game" */
  ["game_update_column"]: game_update_column;
  ["game_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["game_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["game_bool_exp"] | Variable<any, string>;
  };
  /** moves for game */
  ["moves"]: AliasType<{
    after_fen?: boolean | `@${string}`;
    before_fen?: boolean | `@${string}`;
    captured?: boolean | `@${string}`;
    color?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    flags?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    /** An object relationship */
    game?: ValueTypes["game"];
    game_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lan?: boolean | `@${string}`;
    piece?: boolean | `@${string}`;
    promotion?: boolean | `@${string}`;
    san?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "moves" */
  ["moves_aggregate"]: AliasType<{
    aggregate?: ValueTypes["moves_aggregate_fields"];
    nodes?: ValueTypes["moves"];
    __typename?: boolean | `@${string}`;
  }>;
  ["moves_aggregate_bool_exp"]: {
    count?:
      | ValueTypes["moves_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["moves_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["moves_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["moves_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
  /** aggregate fields of "moves" */
  ["moves_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["moves_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["moves_max_fields"];
    min?: ValueTypes["moves_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "moves" */
  ["moves_aggregate_order_by"]: {
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["moves_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["moves_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "moves" */
  ["moves_arr_rel_insert_input"]: {
    data: Array<ValueTypes["moves_insert_input"]> | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["moves_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "moves". All fields are combined with a logical 'AND'. */
  ["moves_bool_exp"]: {
    _and?:
      | Array<ValueTypes["moves_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["moves_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["moves_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    after_fen?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    before_fen?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    captured?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    color?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    flags?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    from?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    game?:
      | ValueTypes["game_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    game_id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    lan?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    piece?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    promotion?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    san?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    to?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "moves" */
  ["moves_constraint"]: moves_constraint;
  /** input type for inserting data into table "moves" */
  ["moves_insert_input"]: {
    after_fen?: string | undefined | null | Variable<any, string>;
    before_fen?: string | undefined | null | Variable<any, string>;
    captured?: string | undefined | null | Variable<any, string>;
    color?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    flags?: string | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    game?:
      | ValueTypes["game_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    game_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lan?: string | undefined | null | Variable<any, string>;
    piece?: string | undefined | null | Variable<any, string>;
    promotion?: string | undefined | null | Variable<any, string>;
    san?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["moves_max_fields"]: AliasType<{
    after_fen?: boolean | `@${string}`;
    before_fen?: boolean | `@${string}`;
    captured?: boolean | `@${string}`;
    color?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    flags?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    game_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lan?: boolean | `@${string}`;
    piece?: boolean | `@${string}`;
    promotion?: boolean | `@${string}`;
    san?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "moves" */
  ["moves_max_order_by"]: {
    after_fen?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    before_fen?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    captured?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    color?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    flags?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    game_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    lan?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    piece?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    promotion?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    san?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["moves_min_fields"]: AliasType<{
    after_fen?: boolean | `@${string}`;
    before_fen?: boolean | `@${string}`;
    captured?: boolean | `@${string}`;
    color?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    flags?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    game_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lan?: boolean | `@${string}`;
    piece?: boolean | `@${string}`;
    promotion?: boolean | `@${string}`;
    san?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "moves" */
  ["moves_min_order_by"]: {
    after_fen?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    before_fen?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    captured?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    color?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    flags?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    game_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    lan?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    piece?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    promotion?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    san?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "moves" */
  ["moves_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["moves"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "moves" */
  ["moves_on_conflict"]: {
    constraint: ValueTypes["moves_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["moves_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["moves_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "moves". */
  ["moves_order_by"]: {
    after_fen?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    before_fen?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    captured?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    color?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    flags?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    game?:
      | ValueTypes["game_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    game_id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    lan?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    piece?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    promotion?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    san?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: moves */
  ["moves_pk_columns_input"]: {
    game_id: ValueTypes["uuid"] | Variable<any, string>;
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "moves" */
  ["moves_select_column"]: moves_select_column;
  /** input type for updating data in table "moves" */
  ["moves_set_input"]: {
    after_fen?: string | undefined | null | Variable<any, string>;
    before_fen?: string | undefined | null | Variable<any, string>;
    captured?: string | undefined | null | Variable<any, string>;
    color?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    flags?: string | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    game_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lan?: string | undefined | null | Variable<any, string>;
    piece?: string | undefined | null | Variable<any, string>;
    promotion?: string | undefined | null | Variable<any, string>;
    san?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "moves" */
  ["moves_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["moves_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["moves_stream_cursor_value_input"]: {
    after_fen?: string | undefined | null | Variable<any, string>;
    before_fen?: string | undefined | null | Variable<any, string>;
    captured?: string | undefined | null | Variable<any, string>;
    color?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    flags?: string | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    game_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lan?: string | undefined | null | Variable<any, string>;
    piece?: string | undefined | null | Variable<any, string>;
    promotion?: string | undefined | null | Variable<any, string>;
    san?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "moves" */
  ["moves_update_column"]: moves_update_column;
  ["moves_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["moves_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["moves_bool_exp"] | Variable<any, string>;
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_game?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["game_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["game_mutation_response"],
    ];
    delete_game_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["game"],
    ];
    delete_moves?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["moves_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["moves_mutation_response"],
    ];
    delete_moves_by_pk?: [
      {
        game_id: ValueTypes["uuid"] | Variable<any, string>;
        id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    delete_user?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["user_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["user_mutation_response"],
    ];
    delete_user_by_pk?: [
      {
        email: string | Variable<any, string>;
        id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    insert_game?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["game_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["game_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game_mutation_response"],
    ];
    insert_game_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["game_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["game_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game"],
    ];
    insert_moves?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["moves_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["moves_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves_mutation_response"],
    ];
    insert_moves_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["moves_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["moves_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    insert_user?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["user_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["user_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["user_mutation_response"],
    ];
    insert_user_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["user_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["user_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    update_game?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["game_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["game_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["game_mutation_response"],
    ];
    update_game_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["game_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns: ValueTypes["game_pk_columns_input"] | Variable<any, string>;
      },
      ValueTypes["game"],
    ];
    update_game_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["game_updates"]> | Variable<any, string>;
      },
      ValueTypes["game_mutation_response"],
    ];
    update_moves?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["moves_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["moves_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["moves_mutation_response"],
    ];
    update_moves_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["moves_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["moves_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    update_moves_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["moves_updates"]> | Variable<any, string>;
      },
      ValueTypes["moves_mutation_response"],
    ];
    update_user?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["user_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["user_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["user_mutation_response"],
    ];
    update_user_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["user_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns: ValueTypes["user_pk_columns_input"] | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    update_user_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["user_updates"]> | Variable<any, string>;
      },
      ValueTypes["user_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    game?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game"],
    ];
    game_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game_aggregate"],
    ];
    game_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["game"],
    ];
    moves?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["moves_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["moves_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["moves_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    moves_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["moves_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["moves_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["moves_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves_aggregate"],
    ];
    moves_by_pk?: [
      {
        game_id: ValueTypes["uuid"] | Variable<any, string>;
        id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    user?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["user_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["user_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["user_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    user_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["user_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["user_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["user_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["user_aggregate"],
    ];
    user_by_pk?: [
      {
        email: string | Variable<any, string>;
        id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    game?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game"],
    ];
    game_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game_aggregate"],
    ];
    game_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["game"],
    ];
    game_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["game_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game"],
    ];
    moves?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["moves_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["moves_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["moves_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    moves_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["moves_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["moves_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["moves_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves_aggregate"],
    ];
    moves_by_pk?: [
      {
        game_id: ValueTypes["uuid"] | Variable<any, string>;
        id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    moves_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["moves_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["moves_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["moves"],
    ];
    user?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["user_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["user_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["user_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    user_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["user_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["user_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["user_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["user_aggregate"],
    ];
    user_by_pk?: [
      {
        email: string | Variable<any, string>;
        id: ValueTypes["uuid"] | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    user_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["user_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["user_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["user"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["timestamptz"]: unknown;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _in?:
      | Array<ValueTypes["timestamptz"]>
      | undefined
      | null
      | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["timestamptz"]>
      | undefined
      | null
      | Variable<any, string>;
  };
  /** users table  */
  ["user"]: AliasType<{
    avatar?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    game_as_black_player?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game"],
    ];
    game_as_black_player_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game_aggregate"],
    ];
    games_as_white_player?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game"],
    ];
    games_as_white_player_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["game_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["game_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["game_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["game_aggregate"],
    ];
    hash_password?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "user" */
  ["user_aggregate"]: AliasType<{
    aggregate?: ValueTypes["user_aggregate_fields"];
    nodes?: ValueTypes["user"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "user" */
  ["user_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["user_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["user_max_fields"];
    min?: ValueTypes["user_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'. */
  ["user_bool_exp"]: {
    _and?:
      | Array<ValueTypes["user_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["user_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["user_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    avatar?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    email?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    firstname?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    game_as_black_player?:
      | ValueTypes["game_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    game_as_black_player_aggregate?:
      | ValueTypes["game_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    games_as_white_player?:
      | ValueTypes["game_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    games_as_white_player_aggregate?:
      | ValueTypes["game_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    hash_password?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    lastname?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "user" */
  ["user_constraint"]: user_constraint;
  /** input type for inserting data into table "user" */
  ["user_insert_input"]: {
    avatar?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    email?: string | undefined | null | Variable<any, string>;
    firstname?: string | undefined | null | Variable<any, string>;
    game_as_black_player?:
      | ValueTypes["game_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    games_as_white_player?:
      | ValueTypes["game_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    hash_password?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lastname?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["user_max_fields"]: AliasType<{
    avatar?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    hash_password?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["user_min_fields"]: AliasType<{
    avatar?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    hash_password?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "user" */
  ["user_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["user"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "user" */
  ["user_obj_rel_insert_input"]: {
    data: ValueTypes["user_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["user_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "user" */
  ["user_on_conflict"]: {
    constraint: ValueTypes["user_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["user_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["user_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "user". */
  ["user_order_by"]: {
    avatar?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    email?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    firstname?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    game_as_black_player_aggregate?:
      | ValueTypes["game_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    games_as_white_player_aggregate?:
      | ValueTypes["game_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    hash_password?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    lastname?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: user */
  ["user_pk_columns_input"]: {
    email: string | Variable<any, string>;
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "user" */
  ["user_select_column"]: user_select_column;
  /** input type for updating data in table "user" */
  ["user_set_input"]: {
    avatar?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    email?: string | undefined | null | Variable<any, string>;
    firstname?: string | undefined | null | Variable<any, string>;
    hash_password?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lastname?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "user" */
  ["user_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["user_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["user_stream_cursor_value_input"]: {
    avatar?: string | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    email?: string | undefined | null | Variable<any, string>;
    firstname?: string | undefined | null | Variable<any, string>;
    hash_password?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lastname?: string | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "user" */
  ["user_update_column"]: user_update_column;
  ["user_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["user_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["user_bool_exp"] | Variable<any, string>;
  };
  ["uuid"]: unknown;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _in?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _nin?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>;
  };
};

export type ResolverInputTypes = {
  ["schema"]: AliasType<{
    query?: ResolverInputTypes["query_root"];
    mutation?: ResolverInputTypes["mutation_root"];
    subscription?: ResolverInputTypes["subscription_root"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined | null;
    _gt?: number | undefined | null;
    _gte?: number | undefined | null;
    _in?: Array<number> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: number | undefined | null;
    _lte?: number | undefined | null;
    _neq?: number | undefined | null;
    _nin?: Array<number> | undefined | null;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined | null;
    _gt?: string | undefined | null;
    _gte?: string | undefined | null;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined | null;
    _in?: Array<string> | undefined | null;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined | null;
    _is_null?: boolean | undefined | null;
    /** does the column match the given pattern */
    _like?: string | undefined | null;
    _lt?: string | undefined | null;
    _lte?: string | undefined | null;
    _neq?: string | undefined | null;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined | null;
    _nin?: Array<string> | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined | null;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined | null;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined | null;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined | null;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined | null;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** game table */
  ["game"]: AliasType<{
    /** An object relationship */
    black_player?: ResolverInputTypes["user"];
    black_player_id?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    moves?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["moves_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["moves_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["moves"],
    ];
    moves_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["moves_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["moves_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["moves_aggregate"],
    ];
    status?: boolean | `@${string}`;
    /** An object relationship */
    white_player?: ResolverInputTypes["user"];
    white_player_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "game" */
  ["game_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["game_aggregate_fields"];
    nodes?: ResolverInputTypes["game"];
    __typename?: boolean | `@${string}`;
  }>;
  ["game_aggregate_bool_exp"]: {
    count?:
      | ResolverInputTypes["game_aggregate_bool_exp_count"]
      | undefined
      | null;
  };
  ["game_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["game_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["game_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "game" */
  ["game_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["game_max_fields"];
    min?: ResolverInputTypes["game_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "game" */
  ["game_aggregate_order_by"]: {
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?: ResolverInputTypes["game_max_order_by"] | undefined | null;
    min?: ResolverInputTypes["game_min_order_by"] | undefined | null;
  };
  /** input type for inserting array relation for remote table "game" */
  ["game_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["game_insert_input"]>;
    /** upsert condition */
    on_conflict?: ResolverInputTypes["game_on_conflict"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "game". All fields are combined with a logical 'AND'. */
  ["game_bool_exp"]: {
    _and?: Array<ResolverInputTypes["game_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["game_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["game_bool_exp"]> | undefined | null;
    black_player?: ResolverInputTypes["user_bool_exp"] | undefined | null;
    black_player_id?:
      | ResolverInputTypes["uuid_comparison_exp"]
      | undefined
      | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    moves?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
    moves_aggregate?:
      | ResolverInputTypes["moves_aggregate_bool_exp"]
      | undefined
      | null;
    status?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    white_player?: ResolverInputTypes["user_bool_exp"] | undefined | null;
    white_player_id?:
      | ResolverInputTypes["uuid_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "game" */
  ["game_constraint"]: game_constraint;
  /** input type for inserting data into table "game" */
  ["game_insert_input"]: {
    black_player?:
      | ResolverInputTypes["user_obj_rel_insert_input"]
      | undefined
      | null;
    black_player_id?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    moves?: ResolverInputTypes["moves_arr_rel_insert_input"] | undefined | null;
    status?: string | undefined | null;
    white_player?:
      | ResolverInputTypes["user_obj_rel_insert_input"]
      | undefined
      | null;
    white_player_id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** aggregate max on columns */
  ["game_max_fields"]: AliasType<{
    black_player_id?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    white_player_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "game" */
  ["game_max_order_by"]: {
    black_player_id?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    status?: ResolverInputTypes["order_by"] | undefined | null;
    white_player_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["game_min_fields"]: AliasType<{
    black_player_id?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    white_player_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "game" */
  ["game_min_order_by"]: {
    black_player_id?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    status?: ResolverInputTypes["order_by"] | undefined | null;
    white_player_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "game" */
  ["game_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["game"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "game" */
  ["game_obj_rel_insert_input"]: {
    data: ResolverInputTypes["game_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["game_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "game" */
  ["game_on_conflict"]: {
    constraint: ResolverInputTypes["game_constraint"];
    update_columns: Array<ResolverInputTypes["game_update_column"]>;
    where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "game". */
  ["game_order_by"]: {
    black_player?: ResolverInputTypes["user_order_by"] | undefined | null;
    black_player_id?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    moves_aggregate?:
      | ResolverInputTypes["moves_aggregate_order_by"]
      | undefined
      | null;
    status?: ResolverInputTypes["order_by"] | undefined | null;
    white_player?: ResolverInputTypes["user_order_by"] | undefined | null;
    white_player_id?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: game */
  ["game_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "game" */
  ["game_select_column"]: game_select_column;
  /** input type for updating data in table "game" */
  ["game_set_input"]: {
    black_player_id?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    status?: string | undefined | null;
    white_player_id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** Streaming cursor of the table "game" */
  ["game_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["game_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["game_stream_cursor_value_input"]: {
    black_player_id?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    status?: string | undefined | null;
    white_player_id?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** update columns of table "game" */
  ["game_update_column"]: game_update_column;
  ["game_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["game_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["game_bool_exp"];
  };
  /** moves for game */
  ["moves"]: AliasType<{
    after_fen?: boolean | `@${string}`;
    before_fen?: boolean | `@${string}`;
    captured?: boolean | `@${string}`;
    color?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    flags?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    /** An object relationship */
    game?: ResolverInputTypes["game"];
    game_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lan?: boolean | `@${string}`;
    piece?: boolean | `@${string}`;
    promotion?: boolean | `@${string}`;
    san?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "moves" */
  ["moves_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["moves_aggregate_fields"];
    nodes?: ResolverInputTypes["moves"];
    __typename?: boolean | `@${string}`;
  }>;
  ["moves_aggregate_bool_exp"]: {
    count?:
      | ResolverInputTypes["moves_aggregate_bool_exp_count"]
      | undefined
      | null;
  };
  ["moves_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["moves_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "moves" */
  ["moves_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["moves_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["moves_max_fields"];
    min?: ResolverInputTypes["moves_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "moves" */
  ["moves_aggregate_order_by"]: {
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?: ResolverInputTypes["moves_max_order_by"] | undefined | null;
    min?: ResolverInputTypes["moves_min_order_by"] | undefined | null;
  };
  /** input type for inserting array relation for remote table "moves" */
  ["moves_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["moves_insert_input"]>;
    /** upsert condition */
    on_conflict?: ResolverInputTypes["moves_on_conflict"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "moves". All fields are combined with a logical 'AND'. */
  ["moves_bool_exp"]: {
    _and?: Array<ResolverInputTypes["moves_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["moves_bool_exp"]> | undefined | null;
    after_fen?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    before_fen?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    captured?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    color?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    flags?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    from?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    game?: ResolverInputTypes["game_bool_exp"] | undefined | null;
    game_id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    lan?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    piece?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    promotion?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    san?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    to?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    updated_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "moves" */
  ["moves_constraint"]: moves_constraint;
  /** input type for inserting data into table "moves" */
  ["moves_insert_input"]: {
    after_fen?: string | undefined | null;
    before_fen?: string | undefined | null;
    captured?: string | undefined | null;
    color?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    flags?: string | undefined | null;
    from?: string | undefined | null;
    game?: ResolverInputTypes["game_obj_rel_insert_input"] | undefined | null;
    game_id?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lan?: string | undefined | null;
    piece?: string | undefined | null;
    promotion?: string | undefined | null;
    san?: string | undefined | null;
    to?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** aggregate max on columns */
  ["moves_max_fields"]: AliasType<{
    after_fen?: boolean | `@${string}`;
    before_fen?: boolean | `@${string}`;
    captured?: boolean | `@${string}`;
    color?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    flags?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    game_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lan?: boolean | `@${string}`;
    piece?: boolean | `@${string}`;
    promotion?: boolean | `@${string}`;
    san?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "moves" */
  ["moves_max_order_by"]: {
    after_fen?: ResolverInputTypes["order_by"] | undefined | null;
    before_fen?: ResolverInputTypes["order_by"] | undefined | null;
    captured?: ResolverInputTypes["order_by"] | undefined | null;
    color?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    flags?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    game_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    lan?: ResolverInputTypes["order_by"] | undefined | null;
    piece?: ResolverInputTypes["order_by"] | undefined | null;
    promotion?: ResolverInputTypes["order_by"] | undefined | null;
    san?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
    updated_at?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["moves_min_fields"]: AliasType<{
    after_fen?: boolean | `@${string}`;
    before_fen?: boolean | `@${string}`;
    captured?: boolean | `@${string}`;
    color?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    flags?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    game_id?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lan?: boolean | `@${string}`;
    piece?: boolean | `@${string}`;
    promotion?: boolean | `@${string}`;
    san?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "moves" */
  ["moves_min_order_by"]: {
    after_fen?: ResolverInputTypes["order_by"] | undefined | null;
    before_fen?: ResolverInputTypes["order_by"] | undefined | null;
    captured?: ResolverInputTypes["order_by"] | undefined | null;
    color?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    flags?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    game_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    lan?: ResolverInputTypes["order_by"] | undefined | null;
    piece?: ResolverInputTypes["order_by"] | undefined | null;
    promotion?: ResolverInputTypes["order_by"] | undefined | null;
    san?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
    updated_at?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "moves" */
  ["moves_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["moves"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "moves" */
  ["moves_on_conflict"]: {
    constraint: ResolverInputTypes["moves_constraint"];
    update_columns: Array<ResolverInputTypes["moves_update_column"]>;
    where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "moves". */
  ["moves_order_by"]: {
    after_fen?: ResolverInputTypes["order_by"] | undefined | null;
    before_fen?: ResolverInputTypes["order_by"] | undefined | null;
    captured?: ResolverInputTypes["order_by"] | undefined | null;
    color?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    flags?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    game?: ResolverInputTypes["game_order_by"] | undefined | null;
    game_id?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    lan?: ResolverInputTypes["order_by"] | undefined | null;
    piece?: ResolverInputTypes["order_by"] | undefined | null;
    promotion?: ResolverInputTypes["order_by"] | undefined | null;
    san?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
    updated_at?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: moves */
  ["moves_pk_columns_input"]: {
    game_id: ResolverInputTypes["uuid"];
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "moves" */
  ["moves_select_column"]: moves_select_column;
  /** input type for updating data in table "moves" */
  ["moves_set_input"]: {
    after_fen?: string | undefined | null;
    before_fen?: string | undefined | null;
    captured?: string | undefined | null;
    color?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    flags?: string | undefined | null;
    from?: string | undefined | null;
    game_id?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lan?: string | undefined | null;
    piece?: string | undefined | null;
    promotion?: string | undefined | null;
    san?: string | undefined | null;
    to?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** Streaming cursor of the table "moves" */
  ["moves_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["moves_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["moves_stream_cursor_value_input"]: {
    after_fen?: string | undefined | null;
    before_fen?: string | undefined | null;
    captured?: string | undefined | null;
    color?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    flags?: string | undefined | null;
    from?: string | undefined | null;
    game_id?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lan?: string | undefined | null;
    piece?: string | undefined | null;
    promotion?: string | undefined | null;
    san?: string | undefined | null;
    to?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** update columns of table "moves" */
  ["moves_update_column"]: moves_update_column;
  ["moves_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["moves_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["moves_bool_exp"];
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_game?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["game_bool_exp"];
      },
      ResolverInputTypes["game_mutation_response"],
    ];
    delete_game_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["game"],
    ];
    delete_moves?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["moves_bool_exp"];
      },
      ResolverInputTypes["moves_mutation_response"],
    ];
    delete_moves_by_pk?: [
      { game_id: ResolverInputTypes["uuid"]; id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["moves"],
    ];
    delete_user?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["user_bool_exp"];
      },
      ResolverInputTypes["user_mutation_response"],
    ];
    delete_user_by_pk?: [
      { email: string; id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["user"],
    ];
    insert_game?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["game_insert_input"]
        > /** upsert condition */;
        on_conflict?: ResolverInputTypes["game_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["game_mutation_response"],
    ];
    insert_game_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["game_insert_input"] /** upsert condition */;
        on_conflict?: ResolverInputTypes["game_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["game"],
    ];
    insert_moves?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["moves_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["moves_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["moves_mutation_response"],
    ];
    insert_moves_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["moves_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["moves_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["moves"],
    ];
    insert_user?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["user_insert_input"]
        > /** upsert condition */;
        on_conflict?: ResolverInputTypes["user_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["user_mutation_response"],
    ];
    insert_user_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["user_insert_input"] /** upsert condition */;
        on_conflict?: ResolverInputTypes["user_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["user"],
    ];
    update_game?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["game_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["game_bool_exp"];
      },
      ResolverInputTypes["game_mutation_response"],
    ];
    update_game_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["game_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["game_pk_columns_input"];
      },
      ResolverInputTypes["game"],
    ];
    update_game_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["game_updates"]>;
      },
      ResolverInputTypes["game_mutation_response"],
    ];
    update_moves?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["moves_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["moves_bool_exp"];
      },
      ResolverInputTypes["moves_mutation_response"],
    ];
    update_moves_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["moves_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["moves_pk_columns_input"];
      },
      ResolverInputTypes["moves"],
    ];
    update_moves_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["moves_updates"]>;
      },
      ResolverInputTypes["moves_mutation_response"],
    ];
    update_user?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["user_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["user_bool_exp"];
      },
      ResolverInputTypes["user_mutation_response"],
    ];
    update_user_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["user_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["user_pk_columns_input"];
      },
      ResolverInputTypes["user"],
    ];
    update_user_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["user_updates"]>;
      },
      ResolverInputTypes["user_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    game?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game"],
    ];
    game_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game_aggregate"],
    ];
    game_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["game"],
    ];
    moves?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["moves_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["moves_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["moves"],
    ];
    moves_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["moves_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["moves_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["moves_aggregate"],
    ];
    moves_by_pk?: [
      { game_id: ResolverInputTypes["uuid"]; id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["moves"],
    ];
    user?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["user_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["user_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["user_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["user"],
    ];
    user_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["user_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["user_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["user_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["user_aggregate"],
    ];
    user_by_pk?: [
      { email: string; id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["user"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    game?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game"],
    ];
    game_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game_aggregate"],
    ];
    game_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["game"],
    ];
    game_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["game_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game"],
    ];
    moves?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["moves_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["moves_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["moves"],
    ];
    moves_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["moves_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["moves_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["moves_aggregate"],
    ];
    moves_by_pk?: [
      { game_id: ResolverInputTypes["uuid"]; id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["moves"],
    ];
    moves_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["moves_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["moves_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["moves"],
    ];
    user?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["user_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["user_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["user_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["user"],
    ];
    user_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["user_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["user_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["user_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["user_aggregate"],
    ];
    user_by_pk?: [
      { email: string; id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["user"],
    ];
    user_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["user_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["user_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["user"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["timestamptz"]: unknown;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ResolverInputTypes["timestamptz"] | undefined | null;
    _gt?: ResolverInputTypes["timestamptz"] | undefined | null;
    _gte?: ResolverInputTypes["timestamptz"] | undefined | null;
    _in?: Array<ResolverInputTypes["timestamptz"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["timestamptz"] | undefined | null;
    _lte?: ResolverInputTypes["timestamptz"] | undefined | null;
    _neq?: ResolverInputTypes["timestamptz"] | undefined | null;
    _nin?: Array<ResolverInputTypes["timestamptz"]> | undefined | null;
  };
  /** users table  */
  ["user"]: AliasType<{
    avatar?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    game_as_black_player?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game"],
    ];
    game_as_black_player_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game_aggregate"],
    ];
    games_as_white_player?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game"],
    ];
    games_as_white_player_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["game_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["game_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["game_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["game_aggregate"],
    ];
    hash_password?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "user" */
  ["user_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["user_aggregate_fields"];
    nodes?: ResolverInputTypes["user"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "user" */
  ["user_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["user_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["user_max_fields"];
    min?: ResolverInputTypes["user_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'. */
  ["user_bool_exp"]: {
    _and?: Array<ResolverInputTypes["user_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["user_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["user_bool_exp"]> | undefined | null;
    avatar?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    email?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    firstname?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    game_as_black_player?:
      | ResolverInputTypes["game_bool_exp"]
      | undefined
      | null;
    game_as_black_player_aggregate?:
      | ResolverInputTypes["game_aggregate_bool_exp"]
      | undefined
      | null;
    games_as_white_player?:
      | ResolverInputTypes["game_bool_exp"]
      | undefined
      | null;
    games_as_white_player_aggregate?:
      | ResolverInputTypes["game_aggregate_bool_exp"]
      | undefined
      | null;
    hash_password?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    lastname?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    updated_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "user" */
  ["user_constraint"]: user_constraint;
  /** input type for inserting data into table "user" */
  ["user_insert_input"]: {
    avatar?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    email?: string | undefined | null;
    firstname?: string | undefined | null;
    game_as_black_player?:
      | ResolverInputTypes["game_arr_rel_insert_input"]
      | undefined
      | null;
    games_as_white_player?:
      | ResolverInputTypes["game_arr_rel_insert_input"]
      | undefined
      | null;
    hash_password?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lastname?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** aggregate max on columns */
  ["user_max_fields"]: AliasType<{
    avatar?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    hash_password?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["user_min_fields"]: AliasType<{
    avatar?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    hash_password?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "user" */
  ["user_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["user"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "user" */
  ["user_obj_rel_insert_input"]: {
    data: ResolverInputTypes["user_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["user_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "user" */
  ["user_on_conflict"]: {
    constraint: ResolverInputTypes["user_constraint"];
    update_columns: Array<ResolverInputTypes["user_update_column"]>;
    where?: ResolverInputTypes["user_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "user". */
  ["user_order_by"]: {
    avatar?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    email?: ResolverInputTypes["order_by"] | undefined | null;
    firstname?: ResolverInputTypes["order_by"] | undefined | null;
    game_as_black_player_aggregate?:
      | ResolverInputTypes["game_aggregate_order_by"]
      | undefined
      | null;
    games_as_white_player_aggregate?:
      | ResolverInputTypes["game_aggregate_order_by"]
      | undefined
      | null;
    hash_password?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    lastname?: ResolverInputTypes["order_by"] | undefined | null;
    updated_at?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: user */
  ["user_pk_columns_input"]: {
    email: string;
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "user" */
  ["user_select_column"]: user_select_column;
  /** input type for updating data in table "user" */
  ["user_set_input"]: {
    avatar?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    email?: string | undefined | null;
    firstname?: string | undefined | null;
    hash_password?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lastname?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** Streaming cursor of the table "user" */
  ["user_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["user_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["user_stream_cursor_value_input"]: {
    avatar?: string | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    email?: string | undefined | null;
    firstname?: string | undefined | null;
    hash_password?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lastname?: string | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** update columns of table "user" */
  ["user_update_column"]: user_update_column;
  ["user_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["user_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["user_bool_exp"];
  };
  ["uuid"]: unknown;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ResolverInputTypes["uuid"] | undefined | null;
    _gt?: ResolverInputTypes["uuid"] | undefined | null;
    _gte?: ResolverInputTypes["uuid"] | undefined | null;
    _in?: Array<ResolverInputTypes["uuid"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["uuid"] | undefined | null;
    _lte?: ResolverInputTypes["uuid"] | undefined | null;
    _neq?: ResolverInputTypes["uuid"] | undefined | null;
    _nin?: Array<ResolverInputTypes["uuid"]> | undefined | null;
  };
};

export type ModelTypes = {
  ["schema"]: {
    query?: ModelTypes["query_root"] | undefined;
    mutation?: ModelTypes["mutation_root"] | undefined;
    subscription?: ModelTypes["subscription_root"] | undefined;
  };
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined;
    _gt?: number | undefined;
    _gte?: number | undefined;
    _in?: Array<number> | undefined;
    _is_null?: boolean | undefined;
    _lt?: number | undefined;
    _lte?: number | undefined;
    _neq?: number | undefined;
    _nin?: Array<number> | undefined;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined;
    _in?: Array<string> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _neq?: string | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined;
    _nin?: Array<string> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined;
  };
  ["cursor_ordering"]: cursor_ordering;
  /** game table */
  ["game"]: {
    /** An object relationship */
    black_player?: ModelTypes["user"] | undefined;
    black_player_id?: ModelTypes["uuid"] | undefined;
    created_at: ModelTypes["timestamptz"];
    id: ModelTypes["uuid"];
    /** An array relationship */
    moves: Array<ModelTypes["moves"]>;
    /** An aggregate relationship */
    moves_aggregate: ModelTypes["moves_aggregate"];
    status: string;
    /** An object relationship */
    white_player?: ModelTypes["user"] | undefined;
    white_player_id?: ModelTypes["uuid"] | undefined;
  };
  /** aggregated selection of "game" */
  ["game_aggregate"]: {
    aggregate?: ModelTypes["game_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["game"]>;
  };
  ["game_aggregate_bool_exp"]: {
    count?: ModelTypes["game_aggregate_bool_exp_count"] | undefined;
  };
  ["game_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["game_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["game_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "game" */
  ["game_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["game_max_fields"] | undefined;
    min?: ModelTypes["game_min_fields"] | undefined;
  };
  /** order by aggregate values of table "game" */
  ["game_aggregate_order_by"]: {
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["game_max_order_by"] | undefined;
    min?: ModelTypes["game_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "game" */
  ["game_arr_rel_insert_input"]: {
    data: Array<ModelTypes["game_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["game_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "game". All fields are combined with a logical 'AND'. */
  ["game_bool_exp"]: {
    _and?: Array<ModelTypes["game_bool_exp"]> | undefined;
    _not?: ModelTypes["game_bool_exp"] | undefined;
    _or?: Array<ModelTypes["game_bool_exp"]> | undefined;
    black_player?: ModelTypes["user_bool_exp"] | undefined;
    black_player_id?: ModelTypes["uuid_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    moves?: ModelTypes["moves_bool_exp"] | undefined;
    moves_aggregate?: ModelTypes["moves_aggregate_bool_exp"] | undefined;
    status?: ModelTypes["String_comparison_exp"] | undefined;
    white_player?: ModelTypes["user_bool_exp"] | undefined;
    white_player_id?: ModelTypes["uuid_comparison_exp"] | undefined;
  };
  ["game_constraint"]: game_constraint;
  /** input type for inserting data into table "game" */
  ["game_insert_input"]: {
    black_player?: ModelTypes["user_obj_rel_insert_input"] | undefined;
    black_player_id?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    moves?: ModelTypes["moves_arr_rel_insert_input"] | undefined;
    status?: string | undefined;
    white_player?: ModelTypes["user_obj_rel_insert_input"] | undefined;
    white_player_id?: ModelTypes["uuid"] | undefined;
  };
  /** aggregate max on columns */
  ["game_max_fields"]: {
    black_player_id?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: ModelTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "game" */
  ["game_max_order_by"]: {
    black_player_id?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    status?: ModelTypes["order_by"] | undefined;
    white_player_id?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["game_min_fields"]: {
    black_player_id?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: ModelTypes["uuid"] | undefined;
  };
  /** order by min() on columns of table "game" */
  ["game_min_order_by"]: {
    black_player_id?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    status?: ModelTypes["order_by"] | undefined;
    white_player_id?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "game" */
  ["game_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["game"]>;
  };
  /** input type for inserting object relation for remote table "game" */
  ["game_obj_rel_insert_input"]: {
    data: ModelTypes["game_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["game_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "game" */
  ["game_on_conflict"]: {
    constraint: ModelTypes["game_constraint"];
    update_columns: Array<ModelTypes["game_update_column"]>;
    where?: ModelTypes["game_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "game". */
  ["game_order_by"]: {
    black_player?: ModelTypes["user_order_by"] | undefined;
    black_player_id?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    moves_aggregate?: ModelTypes["moves_aggregate_order_by"] | undefined;
    status?: ModelTypes["order_by"] | undefined;
    white_player?: ModelTypes["user_order_by"] | undefined;
    white_player_id?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: game */
  ["game_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["game_select_column"]: game_select_column;
  /** input type for updating data in table "game" */
  ["game_set_input"]: {
    black_player_id?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: ModelTypes["uuid"] | undefined;
  };
  /** Streaming cursor of the table "game" */
  ["game_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["game_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["game_stream_cursor_value_input"]: {
    black_player_id?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: ModelTypes["uuid"] | undefined;
  };
  ["game_update_column"]: game_update_column;
  ["game_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["game_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["game_bool_exp"];
  };
  /** moves for game */
  ["moves"]: {
    after_fen: string;
    before_fen: string;
    captured?: string | undefined;
    color: string;
    created_at: ModelTypes["timestamptz"];
    flags: string;
    from: string;
    /** An object relationship */
    game: ModelTypes["game"];
    game_id: ModelTypes["uuid"];
    id: ModelTypes["uuid"];
    lan: string;
    piece: string;
    promotion?: string | undefined;
    san: string;
    to: string;
    updated_at: ModelTypes["timestamptz"];
  };
  /** aggregated selection of "moves" */
  ["moves_aggregate"]: {
    aggregate?: ModelTypes["moves_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["moves"]>;
  };
  ["moves_aggregate_bool_exp"]: {
    count?: ModelTypes["moves_aggregate_bool_exp_count"] | undefined;
  };
  ["moves_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["moves_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["moves_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "moves" */
  ["moves_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["moves_max_fields"] | undefined;
    min?: ModelTypes["moves_min_fields"] | undefined;
  };
  /** order by aggregate values of table "moves" */
  ["moves_aggregate_order_by"]: {
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["moves_max_order_by"] | undefined;
    min?: ModelTypes["moves_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "moves" */
  ["moves_arr_rel_insert_input"]: {
    data: Array<ModelTypes["moves_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["moves_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "moves". All fields are combined with a logical 'AND'. */
  ["moves_bool_exp"]: {
    _and?: Array<ModelTypes["moves_bool_exp"]> | undefined;
    _not?: ModelTypes["moves_bool_exp"] | undefined;
    _or?: Array<ModelTypes["moves_bool_exp"]> | undefined;
    after_fen?: ModelTypes["String_comparison_exp"] | undefined;
    before_fen?: ModelTypes["String_comparison_exp"] | undefined;
    captured?: ModelTypes["String_comparison_exp"] | undefined;
    color?: ModelTypes["String_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    flags?: ModelTypes["String_comparison_exp"] | undefined;
    from?: ModelTypes["String_comparison_exp"] | undefined;
    game?: ModelTypes["game_bool_exp"] | undefined;
    game_id?: ModelTypes["uuid_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    lan?: ModelTypes["String_comparison_exp"] | undefined;
    piece?: ModelTypes["String_comparison_exp"] | undefined;
    promotion?: ModelTypes["String_comparison_exp"] | undefined;
    san?: ModelTypes["String_comparison_exp"] | undefined;
    to?: ModelTypes["String_comparison_exp"] | undefined;
    updated_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
  };
  ["moves_constraint"]: moves_constraint;
  /** input type for inserting data into table "moves" */
  ["moves_insert_input"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game?: ModelTypes["game_obj_rel_insert_input"] | undefined;
    game_id?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["moves_max_fields"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** order by max() on columns of table "moves" */
  ["moves_max_order_by"]: {
    after_fen?: ModelTypes["order_by"] | undefined;
    before_fen?: ModelTypes["order_by"] | undefined;
    captured?: ModelTypes["order_by"] | undefined;
    color?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    flags?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    game_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    lan?: ModelTypes["order_by"] | undefined;
    piece?: ModelTypes["order_by"] | undefined;
    promotion?: ModelTypes["order_by"] | undefined;
    san?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
    updated_at?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["moves_min_fields"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** order by min() on columns of table "moves" */
  ["moves_min_order_by"]: {
    after_fen?: ModelTypes["order_by"] | undefined;
    before_fen?: ModelTypes["order_by"] | undefined;
    captured?: ModelTypes["order_by"] | undefined;
    color?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    flags?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    game_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    lan?: ModelTypes["order_by"] | undefined;
    piece?: ModelTypes["order_by"] | undefined;
    promotion?: ModelTypes["order_by"] | undefined;
    san?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
    updated_at?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "moves" */
  ["moves_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["moves"]>;
  };
  /** on_conflict condition type for table "moves" */
  ["moves_on_conflict"]: {
    constraint: ModelTypes["moves_constraint"];
    update_columns: Array<ModelTypes["moves_update_column"]>;
    where?: ModelTypes["moves_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "moves". */
  ["moves_order_by"]: {
    after_fen?: ModelTypes["order_by"] | undefined;
    before_fen?: ModelTypes["order_by"] | undefined;
    captured?: ModelTypes["order_by"] | undefined;
    color?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    flags?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    game?: ModelTypes["game_order_by"] | undefined;
    game_id?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    lan?: ModelTypes["order_by"] | undefined;
    piece?: ModelTypes["order_by"] | undefined;
    promotion?: ModelTypes["order_by"] | undefined;
    san?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
    updated_at?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: moves */
  ["moves_pk_columns_input"]: {
    game_id: ModelTypes["uuid"];
    id: ModelTypes["uuid"];
  };
  ["moves_select_column"]: moves_select_column;
  /** input type for updating data in table "moves" */
  ["moves_set_input"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "moves" */
  ["moves_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["moves_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["moves_stream_cursor_value_input"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  ["moves_update_column"]: moves_update_column;
  ["moves_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["moves_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["moves_bool_exp"];
  };
  /** mutation root */
  ["mutation_root"]: {
    /** delete data from the table: "game" */
    delete_game?: ModelTypes["game_mutation_response"] | undefined;
    /** delete single row from the table: "game" */
    delete_game_by_pk?: ModelTypes["game"] | undefined;
    /** delete data from the table: "moves" */
    delete_moves?: ModelTypes["moves_mutation_response"] | undefined;
    /** delete single row from the table: "moves" */
    delete_moves_by_pk?: ModelTypes["moves"] | undefined;
    /** delete data from the table: "user" */
    delete_user?: ModelTypes["user_mutation_response"] | undefined;
    /** delete single row from the table: "user" */
    delete_user_by_pk?: ModelTypes["user"] | undefined;
    /** insert data into the table: "game" */
    insert_game?: ModelTypes["game_mutation_response"] | undefined;
    /** insert a single row into the table: "game" */
    insert_game_one?: ModelTypes["game"] | undefined;
    /** insert data into the table: "moves" */
    insert_moves?: ModelTypes["moves_mutation_response"] | undefined;
    /** insert a single row into the table: "moves" */
    insert_moves_one?: ModelTypes["moves"] | undefined;
    /** insert data into the table: "user" */
    insert_user?: ModelTypes["user_mutation_response"] | undefined;
    /** insert a single row into the table: "user" */
    insert_user_one?: ModelTypes["user"] | undefined;
    /** update data of the table: "game" */
    update_game?: ModelTypes["game_mutation_response"] | undefined;
    /** update single row of the table: "game" */
    update_game_by_pk?: ModelTypes["game"] | undefined;
    /** update multiples rows of table: "game" */
    update_game_many?:
      | Array<ModelTypes["game_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "moves" */
    update_moves?: ModelTypes["moves_mutation_response"] | undefined;
    /** update single row of the table: "moves" */
    update_moves_by_pk?: ModelTypes["moves"] | undefined;
    /** update multiples rows of table: "moves" */
    update_moves_many?:
      | Array<ModelTypes["moves_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "user" */
    update_user?: ModelTypes["user_mutation_response"] | undefined;
    /** update single row of the table: "user" */
    update_user_by_pk?: ModelTypes["user"] | undefined;
    /** update multiples rows of table: "user" */
    update_user_many?:
      | Array<ModelTypes["user_mutation_response"] | undefined>
      | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "game" */
    game: Array<ModelTypes["game"]>;
    /** fetch aggregated fields from the table: "game" */
    game_aggregate: ModelTypes["game_aggregate"];
    /** fetch data from the table: "game" using primary key columns */
    game_by_pk?: ModelTypes["game"] | undefined;
    /** An array relationship */
    moves: Array<ModelTypes["moves"]>;
    /** An aggregate relationship */
    moves_aggregate: ModelTypes["moves_aggregate"];
    /** fetch data from the table: "moves" using primary key columns */
    moves_by_pk?: ModelTypes["moves"] | undefined;
    /** fetch data from the table: "user" */
    user: Array<ModelTypes["user"]>;
    /** fetch aggregated fields from the table: "user" */
    user_aggregate: ModelTypes["user_aggregate"];
    /** fetch data from the table: "user" using primary key columns */
    user_by_pk?: ModelTypes["user"] | undefined;
  };
  ["subscription_root"]: {
    /** fetch data from the table: "game" */
    game: Array<ModelTypes["game"]>;
    /** fetch aggregated fields from the table: "game" */
    game_aggregate: ModelTypes["game_aggregate"];
    /** fetch data from the table: "game" using primary key columns */
    game_by_pk?: ModelTypes["game"] | undefined;
    /** fetch data from the table in a streaming manner: "game" */
    game_stream: Array<ModelTypes["game"]>;
    /** An array relationship */
    moves: Array<ModelTypes["moves"]>;
    /** An aggregate relationship */
    moves_aggregate: ModelTypes["moves_aggregate"];
    /** fetch data from the table: "moves" using primary key columns */
    moves_by_pk?: ModelTypes["moves"] | undefined;
    /** fetch data from the table in a streaming manner: "moves" */
    moves_stream: Array<ModelTypes["moves"]>;
    /** fetch data from the table: "user" */
    user: Array<ModelTypes["user"]>;
    /** fetch aggregated fields from the table: "user" */
    user_aggregate: ModelTypes["user_aggregate"];
    /** fetch data from the table: "user" using primary key columns */
    user_by_pk?: ModelTypes["user"] | undefined;
    /** fetch data from the table in a streaming manner: "user" */
    user_stream: Array<ModelTypes["user"]>;
  };
  ["timestamptz"]: any;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ModelTypes["timestamptz"] | undefined;
    _gt?: ModelTypes["timestamptz"] | undefined;
    _gte?: ModelTypes["timestamptz"] | undefined;
    _in?: Array<ModelTypes["timestamptz"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["timestamptz"] | undefined;
    _lte?: ModelTypes["timestamptz"] | undefined;
    _neq?: ModelTypes["timestamptz"] | undefined;
    _nin?: Array<ModelTypes["timestamptz"]> | undefined;
  };
  /** users table  */
  ["user"]: {
    avatar?: string | undefined;
    created_at: ModelTypes["timestamptz"];
    email: string;
    firstname: string;
    /** An array relationship */
    game_as_black_player: Array<ModelTypes["game"]>;
    /** An aggregate relationship */
    game_as_black_player_aggregate: ModelTypes["game_aggregate"];
    /** An array relationship */
    games_as_white_player: Array<ModelTypes["game"]>;
    /** An aggregate relationship */
    games_as_white_player_aggregate: ModelTypes["game_aggregate"];
    hash_password: string;
    id: ModelTypes["uuid"];
    lastname: string;
    updated_at: ModelTypes["timestamptz"];
  };
  /** aggregated selection of "user" */
  ["user_aggregate"]: {
    aggregate?: ModelTypes["user_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["user"]>;
  };
  /** aggregate fields of "user" */
  ["user_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["user_max_fields"] | undefined;
    min?: ModelTypes["user_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'. */
  ["user_bool_exp"]: {
    _and?: Array<ModelTypes["user_bool_exp"]> | undefined;
    _not?: ModelTypes["user_bool_exp"] | undefined;
    _or?: Array<ModelTypes["user_bool_exp"]> | undefined;
    avatar?: ModelTypes["String_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    email?: ModelTypes["String_comparison_exp"] | undefined;
    firstname?: ModelTypes["String_comparison_exp"] | undefined;
    game_as_black_player?: ModelTypes["game_bool_exp"] | undefined;
    game_as_black_player_aggregate?:
      | ModelTypes["game_aggregate_bool_exp"]
      | undefined;
    games_as_white_player?: ModelTypes["game_bool_exp"] | undefined;
    games_as_white_player_aggregate?:
      | ModelTypes["game_aggregate_bool_exp"]
      | undefined;
    hash_password?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    lastname?: ModelTypes["String_comparison_exp"] | undefined;
    updated_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
  };
  ["user_constraint"]: user_constraint;
  /** input type for inserting data into table "user" */
  ["user_insert_input"]: {
    avatar?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    game_as_black_player?: ModelTypes["game_arr_rel_insert_input"] | undefined;
    games_as_white_player?: ModelTypes["game_arr_rel_insert_input"] | undefined;
    hash_password?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["user_max_fields"]: {
    avatar?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["user_min_fields"]: {
    avatar?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "user" */
  ["user_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["user"]>;
  };
  /** input type for inserting object relation for remote table "user" */
  ["user_obj_rel_insert_input"]: {
    data: ModelTypes["user_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["user_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "user" */
  ["user_on_conflict"]: {
    constraint: ModelTypes["user_constraint"];
    update_columns: Array<ModelTypes["user_update_column"]>;
    where?: ModelTypes["user_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "user". */
  ["user_order_by"]: {
    avatar?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    email?: ModelTypes["order_by"] | undefined;
    firstname?: ModelTypes["order_by"] | undefined;
    game_as_black_player_aggregate?:
      | ModelTypes["game_aggregate_order_by"]
      | undefined;
    games_as_white_player_aggregate?:
      | ModelTypes["game_aggregate_order_by"]
      | undefined;
    hash_password?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    lastname?: ModelTypes["order_by"] | undefined;
    updated_at?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: user */
  ["user_pk_columns_input"]: {
    email: string;
    id: ModelTypes["uuid"];
  };
  ["user_select_column"]: user_select_column;
  /** input type for updating data in table "user" */
  ["user_set_input"]: {
    avatar?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "user" */
  ["user_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["user_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["user_stream_cursor_value_input"]: {
    avatar?: string | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  ["user_update_column"]: user_update_column;
  ["user_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["user_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["user_bool_exp"];
  };
  ["uuid"]: any;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ModelTypes["uuid"] | undefined;
    _gt?: ModelTypes["uuid"] | undefined;
    _gte?: ModelTypes["uuid"] | undefined;
    _in?: Array<ModelTypes["uuid"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["uuid"] | undefined;
    _lte?: ModelTypes["uuid"] | undefined;
    _neq?: ModelTypes["uuid"] | undefined;
    _nin?: Array<ModelTypes["uuid"]> | undefined;
  };
};

export type GraphQLTypes = {
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined;
    _gt?: number | undefined;
    _gte?: number | undefined;
    _in?: Array<number> | undefined;
    _is_null?: boolean | undefined;
    _lt?: number | undefined;
    _lte?: number | undefined;
    _neq?: number | undefined;
    _nin?: Array<number> | undefined;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined;
    _in?: Array<string> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _neq?: string | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined;
    _nin?: Array<string> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** game table */
  ["game"]: {
    __typename: "game";
    /** An object relationship */
    black_player?: GraphQLTypes["user"] | undefined;
    black_player_id?: GraphQLTypes["uuid"] | undefined;
    created_at: GraphQLTypes["timestamptz"];
    id: GraphQLTypes["uuid"];
    /** An array relationship */
    moves: Array<GraphQLTypes["moves"]>;
    /** An aggregate relationship */
    moves_aggregate: GraphQLTypes["moves_aggregate"];
    status: string;
    /** An object relationship */
    white_player?: GraphQLTypes["user"] | undefined;
    white_player_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregated selection of "game" */
  ["game_aggregate"]: {
    __typename: "game_aggregate";
    aggregate?: GraphQLTypes["game_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["game"]>;
  };
  ["game_aggregate_bool_exp"]: {
    count?: GraphQLTypes["game_aggregate_bool_exp_count"] | undefined;
  };
  ["game_aggregate_bool_exp_count"]: {
    arguments?: Array<GraphQLTypes["game_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["game_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "game" */
  ["game_aggregate_fields"]: {
    __typename: "game_aggregate_fields";
    count: number;
    max?: GraphQLTypes["game_max_fields"] | undefined;
    min?: GraphQLTypes["game_min_fields"] | undefined;
  };
  /** order by aggregate values of table "game" */
  ["game_aggregate_order_by"]: {
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["game_max_order_by"] | undefined;
    min?: GraphQLTypes["game_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "game" */
  ["game_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["game_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["game_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "game". All fields are combined with a logical 'AND'. */
  ["game_bool_exp"]: {
    _and?: Array<GraphQLTypes["game_bool_exp"]> | undefined;
    _not?: GraphQLTypes["game_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["game_bool_exp"]> | undefined;
    black_player?: GraphQLTypes["user_bool_exp"] | undefined;
    black_player_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    moves?: GraphQLTypes["moves_bool_exp"] | undefined;
    moves_aggregate?: GraphQLTypes["moves_aggregate_bool_exp"] | undefined;
    status?: GraphQLTypes["String_comparison_exp"] | undefined;
    white_player?: GraphQLTypes["user_bool_exp"] | undefined;
    white_player_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "game" */
  ["game_constraint"]: game_constraint;
  /** input type for inserting data into table "game" */
  ["game_insert_input"]: {
    black_player?: GraphQLTypes["user_obj_rel_insert_input"] | undefined;
    black_player_id?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    moves?: GraphQLTypes["moves_arr_rel_insert_input"] | undefined;
    status?: string | undefined;
    white_player?: GraphQLTypes["user_obj_rel_insert_input"] | undefined;
    white_player_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregate max on columns */
  ["game_max_fields"]: {
    __typename: "game_max_fields";
    black_player_id?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "game" */
  ["game_max_order_by"]: {
    black_player_id?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    status?: GraphQLTypes["order_by"] | undefined;
    white_player_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["game_min_fields"]: {
    __typename: "game_min_fields";
    black_player_id?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by min() on columns of table "game" */
  ["game_min_order_by"]: {
    black_player_id?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    status?: GraphQLTypes["order_by"] | undefined;
    white_player_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "game" */
  ["game_mutation_response"]: {
    __typename: "game_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["game"]>;
  };
  /** input type for inserting object relation for remote table "game" */
  ["game_obj_rel_insert_input"]: {
    data: GraphQLTypes["game_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["game_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "game" */
  ["game_on_conflict"]: {
    constraint: GraphQLTypes["game_constraint"];
    update_columns: Array<GraphQLTypes["game_update_column"]>;
    where?: GraphQLTypes["game_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "game". */
  ["game_order_by"]: {
    black_player?: GraphQLTypes["user_order_by"] | undefined;
    black_player_id?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    moves_aggregate?: GraphQLTypes["moves_aggregate_order_by"] | undefined;
    status?: GraphQLTypes["order_by"] | undefined;
    white_player?: GraphQLTypes["user_order_by"] | undefined;
    white_player_id?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: game */
  ["game_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "game" */
  ["game_select_column"]: game_select_column;
  /** input type for updating data in table "game" */
  ["game_set_input"]: {
    black_player_id?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** Streaming cursor of the table "game" */
  ["game_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["game_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["game_stream_cursor_value_input"]: {
    black_player_id?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    status?: string | undefined;
    white_player_id?: GraphQLTypes["uuid"] | undefined;
  };
  /** update columns of table "game" */
  ["game_update_column"]: game_update_column;
  ["game_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["game_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["game_bool_exp"];
  };
  /** moves for game */
  ["moves"]: {
    __typename: "moves";
    after_fen: string;
    before_fen: string;
    captured?: string | undefined;
    color: string;
    created_at: GraphQLTypes["timestamptz"];
    flags: string;
    from: string;
    /** An object relationship */
    game: GraphQLTypes["game"];
    game_id: GraphQLTypes["uuid"];
    id: GraphQLTypes["uuid"];
    lan: string;
    piece: string;
    promotion?: string | undefined;
    san: string;
    to: string;
    updated_at: GraphQLTypes["timestamptz"];
  };
  /** aggregated selection of "moves" */
  ["moves_aggregate"]: {
    __typename: "moves_aggregate";
    aggregate?: GraphQLTypes["moves_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["moves"]>;
  };
  ["moves_aggregate_bool_exp"]: {
    count?: GraphQLTypes["moves_aggregate_bool_exp_count"] | undefined;
  };
  ["moves_aggregate_bool_exp_count"]: {
    arguments?: Array<GraphQLTypes["moves_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["moves_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "moves" */
  ["moves_aggregate_fields"]: {
    __typename: "moves_aggregate_fields";
    count: number;
    max?: GraphQLTypes["moves_max_fields"] | undefined;
    min?: GraphQLTypes["moves_min_fields"] | undefined;
  };
  /** order by aggregate values of table "moves" */
  ["moves_aggregate_order_by"]: {
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["moves_max_order_by"] | undefined;
    min?: GraphQLTypes["moves_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "moves" */
  ["moves_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["moves_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["moves_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "moves". All fields are combined with a logical 'AND'. */
  ["moves_bool_exp"]: {
    _and?: Array<GraphQLTypes["moves_bool_exp"]> | undefined;
    _not?: GraphQLTypes["moves_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["moves_bool_exp"]> | undefined;
    after_fen?: GraphQLTypes["String_comparison_exp"] | undefined;
    before_fen?: GraphQLTypes["String_comparison_exp"] | undefined;
    captured?: GraphQLTypes["String_comparison_exp"] | undefined;
    color?: GraphQLTypes["String_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    flags?: GraphQLTypes["String_comparison_exp"] | undefined;
    from?: GraphQLTypes["String_comparison_exp"] | undefined;
    game?: GraphQLTypes["game_bool_exp"] | undefined;
    game_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    lan?: GraphQLTypes["String_comparison_exp"] | undefined;
    piece?: GraphQLTypes["String_comparison_exp"] | undefined;
    promotion?: GraphQLTypes["String_comparison_exp"] | undefined;
    san?: GraphQLTypes["String_comparison_exp"] | undefined;
    to?: GraphQLTypes["String_comparison_exp"] | undefined;
    updated_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "moves" */
  ["moves_constraint"]: moves_constraint;
  /** input type for inserting data into table "moves" */
  ["moves_insert_input"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game?: GraphQLTypes["game_obj_rel_insert_input"] | undefined;
    game_id?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["moves_max_fields"]: {
    __typename: "moves_max_fields";
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** order by max() on columns of table "moves" */
  ["moves_max_order_by"]: {
    after_fen?: GraphQLTypes["order_by"] | undefined;
    before_fen?: GraphQLTypes["order_by"] | undefined;
    captured?: GraphQLTypes["order_by"] | undefined;
    color?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    flags?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    game_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    lan?: GraphQLTypes["order_by"] | undefined;
    piece?: GraphQLTypes["order_by"] | undefined;
    promotion?: GraphQLTypes["order_by"] | undefined;
    san?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
    updated_at?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["moves_min_fields"]: {
    __typename: "moves_min_fields";
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** order by min() on columns of table "moves" */
  ["moves_min_order_by"]: {
    after_fen?: GraphQLTypes["order_by"] | undefined;
    before_fen?: GraphQLTypes["order_by"] | undefined;
    captured?: GraphQLTypes["order_by"] | undefined;
    color?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    flags?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    game_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    lan?: GraphQLTypes["order_by"] | undefined;
    piece?: GraphQLTypes["order_by"] | undefined;
    promotion?: GraphQLTypes["order_by"] | undefined;
    san?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
    updated_at?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "moves" */
  ["moves_mutation_response"]: {
    __typename: "moves_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["moves"]>;
  };
  /** on_conflict condition type for table "moves" */
  ["moves_on_conflict"]: {
    constraint: GraphQLTypes["moves_constraint"];
    update_columns: Array<GraphQLTypes["moves_update_column"]>;
    where?: GraphQLTypes["moves_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "moves". */
  ["moves_order_by"]: {
    after_fen?: GraphQLTypes["order_by"] | undefined;
    before_fen?: GraphQLTypes["order_by"] | undefined;
    captured?: GraphQLTypes["order_by"] | undefined;
    color?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    flags?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    game?: GraphQLTypes["game_order_by"] | undefined;
    game_id?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    lan?: GraphQLTypes["order_by"] | undefined;
    piece?: GraphQLTypes["order_by"] | undefined;
    promotion?: GraphQLTypes["order_by"] | undefined;
    san?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
    updated_at?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: moves */
  ["moves_pk_columns_input"]: {
    game_id: GraphQLTypes["uuid"];
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "moves" */
  ["moves_select_column"]: moves_select_column;
  /** input type for updating data in table "moves" */
  ["moves_set_input"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "moves" */
  ["moves_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["moves_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["moves_stream_cursor_value_input"]: {
    after_fen?: string | undefined;
    before_fen?: string | undefined;
    captured?: string | undefined;
    color?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    flags?: string | undefined;
    from?: string | undefined;
    game_id?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lan?: string | undefined;
    piece?: string | undefined;
    promotion?: string | undefined;
    san?: string | undefined;
    to?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** update columns of table "moves" */
  ["moves_update_column"]: moves_update_column;
  ["moves_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["moves_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["moves_bool_exp"];
  };
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** delete data from the table: "game" */
    delete_game?: GraphQLTypes["game_mutation_response"] | undefined;
    /** delete single row from the table: "game" */
    delete_game_by_pk?: GraphQLTypes["game"] | undefined;
    /** delete data from the table: "moves" */
    delete_moves?: GraphQLTypes["moves_mutation_response"] | undefined;
    /** delete single row from the table: "moves" */
    delete_moves_by_pk?: GraphQLTypes["moves"] | undefined;
    /** delete data from the table: "user" */
    delete_user?: GraphQLTypes["user_mutation_response"] | undefined;
    /** delete single row from the table: "user" */
    delete_user_by_pk?: GraphQLTypes["user"] | undefined;
    /** insert data into the table: "game" */
    insert_game?: GraphQLTypes["game_mutation_response"] | undefined;
    /** insert a single row into the table: "game" */
    insert_game_one?: GraphQLTypes["game"] | undefined;
    /** insert data into the table: "moves" */
    insert_moves?: GraphQLTypes["moves_mutation_response"] | undefined;
    /** insert a single row into the table: "moves" */
    insert_moves_one?: GraphQLTypes["moves"] | undefined;
    /** insert data into the table: "user" */
    insert_user?: GraphQLTypes["user_mutation_response"] | undefined;
    /** insert a single row into the table: "user" */
    insert_user_one?: GraphQLTypes["user"] | undefined;
    /** update data of the table: "game" */
    update_game?: GraphQLTypes["game_mutation_response"] | undefined;
    /** update single row of the table: "game" */
    update_game_by_pk?: GraphQLTypes["game"] | undefined;
    /** update multiples rows of table: "game" */
    update_game_many?:
      | Array<GraphQLTypes["game_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "moves" */
    update_moves?: GraphQLTypes["moves_mutation_response"] | undefined;
    /** update single row of the table: "moves" */
    update_moves_by_pk?: GraphQLTypes["moves"] | undefined;
    /** update multiples rows of table: "moves" */
    update_moves_many?:
      | Array<GraphQLTypes["moves_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "user" */
    update_user?: GraphQLTypes["user_mutation_response"] | undefined;
    /** update single row of the table: "user" */
    update_user_by_pk?: GraphQLTypes["user"] | undefined;
    /** update multiples rows of table: "user" */
    update_user_many?:
      | Array<GraphQLTypes["user_mutation_response"] | undefined>
      | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "game" */
    game: Array<GraphQLTypes["game"]>;
    /** fetch aggregated fields from the table: "game" */
    game_aggregate: GraphQLTypes["game_aggregate"];
    /** fetch data from the table: "game" using primary key columns */
    game_by_pk?: GraphQLTypes["game"] | undefined;
    /** An array relationship */
    moves: Array<GraphQLTypes["moves"]>;
    /** An aggregate relationship */
    moves_aggregate: GraphQLTypes["moves_aggregate"];
    /** fetch data from the table: "moves" using primary key columns */
    moves_by_pk?: GraphQLTypes["moves"] | undefined;
    /** fetch data from the table: "user" */
    user: Array<GraphQLTypes["user"]>;
    /** fetch aggregated fields from the table: "user" */
    user_aggregate: GraphQLTypes["user_aggregate"];
    /** fetch data from the table: "user" using primary key columns */
    user_by_pk?: GraphQLTypes["user"] | undefined;
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "game" */
    game: Array<GraphQLTypes["game"]>;
    /** fetch aggregated fields from the table: "game" */
    game_aggregate: GraphQLTypes["game_aggregate"];
    /** fetch data from the table: "game" using primary key columns */
    game_by_pk?: GraphQLTypes["game"] | undefined;
    /** fetch data from the table in a streaming manner: "game" */
    game_stream: Array<GraphQLTypes["game"]>;
    /** An array relationship */
    moves: Array<GraphQLTypes["moves"]>;
    /** An aggregate relationship */
    moves_aggregate: GraphQLTypes["moves_aggregate"];
    /** fetch data from the table: "moves" using primary key columns */
    moves_by_pk?: GraphQLTypes["moves"] | undefined;
    /** fetch data from the table in a streaming manner: "moves" */
    moves_stream: Array<GraphQLTypes["moves"]>;
    /** fetch data from the table: "user" */
    user: Array<GraphQLTypes["user"]>;
    /** fetch aggregated fields from the table: "user" */
    user_aggregate: GraphQLTypes["user_aggregate"];
    /** fetch data from the table: "user" using primary key columns */
    user_by_pk?: GraphQLTypes["user"] | undefined;
    /** fetch data from the table in a streaming manner: "user" */
    user_stream: Array<GraphQLTypes["user"]>;
  };
  ["timestamptz"]: "scalar" & { name: "timestamptz" };
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: GraphQLTypes["timestamptz"] | undefined;
    _gt?: GraphQLTypes["timestamptz"] | undefined;
    _gte?: GraphQLTypes["timestamptz"] | undefined;
    _in?: Array<GraphQLTypes["timestamptz"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["timestamptz"] | undefined;
    _lte?: GraphQLTypes["timestamptz"] | undefined;
    _neq?: GraphQLTypes["timestamptz"] | undefined;
    _nin?: Array<GraphQLTypes["timestamptz"]> | undefined;
  };
  /** users table  */
  ["user"]: {
    __typename: "user";
    avatar?: string | undefined;
    created_at: GraphQLTypes["timestamptz"];
    email: string;
    firstname: string;
    /** An array relationship */
    game_as_black_player: Array<GraphQLTypes["game"]>;
    /** An aggregate relationship */
    game_as_black_player_aggregate: GraphQLTypes["game_aggregate"];
    /** An array relationship */
    games_as_white_player: Array<GraphQLTypes["game"]>;
    /** An aggregate relationship */
    games_as_white_player_aggregate: GraphQLTypes["game_aggregate"];
    hash_password: string;
    id: GraphQLTypes["uuid"];
    lastname: string;
    updated_at: GraphQLTypes["timestamptz"];
  };
  /** aggregated selection of "user" */
  ["user_aggregate"]: {
    __typename: "user_aggregate";
    aggregate?: GraphQLTypes["user_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["user"]>;
  };
  /** aggregate fields of "user" */
  ["user_aggregate_fields"]: {
    __typename: "user_aggregate_fields";
    count: number;
    max?: GraphQLTypes["user_max_fields"] | undefined;
    min?: GraphQLTypes["user_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'. */
  ["user_bool_exp"]: {
    _and?: Array<GraphQLTypes["user_bool_exp"]> | undefined;
    _not?: GraphQLTypes["user_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["user_bool_exp"]> | undefined;
    avatar?: GraphQLTypes["String_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    email?: GraphQLTypes["String_comparison_exp"] | undefined;
    firstname?: GraphQLTypes["String_comparison_exp"] | undefined;
    game_as_black_player?: GraphQLTypes["game_bool_exp"] | undefined;
    game_as_black_player_aggregate?:
      | GraphQLTypes["game_aggregate_bool_exp"]
      | undefined;
    games_as_white_player?: GraphQLTypes["game_bool_exp"] | undefined;
    games_as_white_player_aggregate?:
      | GraphQLTypes["game_aggregate_bool_exp"]
      | undefined;
    hash_password?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    lastname?: GraphQLTypes["String_comparison_exp"] | undefined;
    updated_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "user" */
  ["user_constraint"]: user_constraint;
  /** input type for inserting data into table "user" */
  ["user_insert_input"]: {
    avatar?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    game_as_black_player?:
      | GraphQLTypes["game_arr_rel_insert_input"]
      | undefined;
    games_as_white_player?:
      | GraphQLTypes["game_arr_rel_insert_input"]
      | undefined;
    hash_password?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["user_max_fields"]: {
    __typename: "user_max_fields";
    avatar?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["user_min_fields"]: {
    __typename: "user_min_fields";
    avatar?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "user" */
  ["user_mutation_response"]: {
    __typename: "user_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["user"]>;
  };
  /** input type for inserting object relation for remote table "user" */
  ["user_obj_rel_insert_input"]: {
    data: GraphQLTypes["user_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["user_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "user" */
  ["user_on_conflict"]: {
    constraint: GraphQLTypes["user_constraint"];
    update_columns: Array<GraphQLTypes["user_update_column"]>;
    where?: GraphQLTypes["user_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "user". */
  ["user_order_by"]: {
    avatar?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    email?: GraphQLTypes["order_by"] | undefined;
    firstname?: GraphQLTypes["order_by"] | undefined;
    game_as_black_player_aggregate?:
      | GraphQLTypes["game_aggregate_order_by"]
      | undefined;
    games_as_white_player_aggregate?:
      | GraphQLTypes["game_aggregate_order_by"]
      | undefined;
    hash_password?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    lastname?: GraphQLTypes["order_by"] | undefined;
    updated_at?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: user */
  ["user_pk_columns_input"]: {
    email: string;
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "user" */
  ["user_select_column"]: user_select_column;
  /** input type for updating data in table "user" */
  ["user_set_input"]: {
    avatar?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "user" */
  ["user_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["user_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["user_stream_cursor_value_input"]: {
    avatar?: string | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    hash_password?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** update columns of table "user" */
  ["user_update_column"]: user_update_column;
  ["user_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["user_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["user_bool_exp"];
  };
  ["uuid"]: "scalar" & { name: "uuid" };
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: GraphQLTypes["uuid"] | undefined;
    _gt?: GraphQLTypes["uuid"] | undefined;
    _gte?: GraphQLTypes["uuid"] | undefined;
    _in?: Array<GraphQLTypes["uuid"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["uuid"] | undefined;
    _lte?: GraphQLTypes["uuid"] | undefined;
    _neq?: GraphQLTypes["uuid"] | undefined;
    _nin?: Array<GraphQLTypes["uuid"]> | undefined;
  };
};
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** unique or primary key constraints on table "game" */
export const enum game_constraint {
  game_id_key = "game_id_key",
  game_pkey = "game_pkey",
}
/** select columns of table "game" */
export const enum game_select_column {
  black_player_id = "black_player_id",
  created_at = "created_at",
  id = "id",
  status = "status",
  white_player_id = "white_player_id",
}
/** update columns of table "game" */
export const enum game_update_column {
  black_player_id = "black_player_id",
  created_at = "created_at",
  id = "id",
  status = "status",
  white_player_id = "white_player_id",
}
/** unique or primary key constraints on table "moves" */
export const enum moves_constraint {
  moves_id_key = "moves_id_key",
  moves_pkey = "moves_pkey",
}
/** select columns of table "moves" */
export const enum moves_select_column {
  after_fen = "after_fen",
  before_fen = "before_fen",
  captured = "captured",
  color = "color",
  created_at = "created_at",
  flags = "flags",
  from = "from",
  game_id = "game_id",
  id = "id",
  lan = "lan",
  piece = "piece",
  promotion = "promotion",
  san = "san",
  to = "to",
  updated_at = "updated_at",
}
/** update columns of table "moves" */
export const enum moves_update_column {
  after_fen = "after_fen",
  before_fen = "before_fen",
  captured = "captured",
  color = "color",
  created_at = "created_at",
  flags = "flags",
  from = "from",
  game_id = "game_id",
  id = "id",
  lan = "lan",
  piece = "piece",
  promotion = "promotion",
  san = "san",
  to = "to",
  updated_at = "updated_at",
}
/** column ordering options */
export const enum order_by {
  asc = "asc",
  asc_nulls_first = "asc_nulls_first",
  asc_nulls_last = "asc_nulls_last",
  desc = "desc",
  desc_nulls_first = "desc_nulls_first",
  desc_nulls_last = "desc_nulls_last",
}
/** unique or primary key constraints on table "user" */
export const enum user_constraint {
  user_email_key = "user_email_key",
  user_id_key = "user_id_key",
  user_pkey = "user_pkey",
}
/** select columns of table "user" */
export const enum user_select_column {
  avatar = "avatar",
  created_at = "created_at",
  email = "email",
  firstname = "firstname",
  hash_password = "hash_password",
  id = "id",
  lastname = "lastname",
  updated_at = "updated_at",
}
/** update columns of table "user" */
export const enum user_update_column {
  avatar = "avatar",
  created_at = "created_at",
  email = "email",
  firstname = "firstname",
  hash_password = "hash_password",
  id = "id",
  lastname = "lastname",
  updated_at = "updated_at",
}

type ZEUS_VARIABLES = {
  ["Int_comparison_exp"]: ValueTypes["Int_comparison_exp"];
  ["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["game_aggregate_bool_exp"]: ValueTypes["game_aggregate_bool_exp"];
  ["game_aggregate_bool_exp_count"]: ValueTypes["game_aggregate_bool_exp_count"];
  ["game_aggregate_order_by"]: ValueTypes["game_aggregate_order_by"];
  ["game_arr_rel_insert_input"]: ValueTypes["game_arr_rel_insert_input"];
  ["game_bool_exp"]: ValueTypes["game_bool_exp"];
  ["game_constraint"]: ValueTypes["game_constraint"];
  ["game_insert_input"]: ValueTypes["game_insert_input"];
  ["game_max_order_by"]: ValueTypes["game_max_order_by"];
  ["game_min_order_by"]: ValueTypes["game_min_order_by"];
  ["game_obj_rel_insert_input"]: ValueTypes["game_obj_rel_insert_input"];
  ["game_on_conflict"]: ValueTypes["game_on_conflict"];
  ["game_order_by"]: ValueTypes["game_order_by"];
  ["game_pk_columns_input"]: ValueTypes["game_pk_columns_input"];
  ["game_select_column"]: ValueTypes["game_select_column"];
  ["game_set_input"]: ValueTypes["game_set_input"];
  ["game_stream_cursor_input"]: ValueTypes["game_stream_cursor_input"];
  ["game_stream_cursor_value_input"]: ValueTypes["game_stream_cursor_value_input"];
  ["game_update_column"]: ValueTypes["game_update_column"];
  ["game_updates"]: ValueTypes["game_updates"];
  ["moves_aggregate_bool_exp"]: ValueTypes["moves_aggregate_bool_exp"];
  ["moves_aggregate_bool_exp_count"]: ValueTypes["moves_aggregate_bool_exp_count"];
  ["moves_aggregate_order_by"]: ValueTypes["moves_aggregate_order_by"];
  ["moves_arr_rel_insert_input"]: ValueTypes["moves_arr_rel_insert_input"];
  ["moves_bool_exp"]: ValueTypes["moves_bool_exp"];
  ["moves_constraint"]: ValueTypes["moves_constraint"];
  ["moves_insert_input"]: ValueTypes["moves_insert_input"];
  ["moves_max_order_by"]: ValueTypes["moves_max_order_by"];
  ["moves_min_order_by"]: ValueTypes["moves_min_order_by"];
  ["moves_on_conflict"]: ValueTypes["moves_on_conflict"];
  ["moves_order_by"]: ValueTypes["moves_order_by"];
  ["moves_pk_columns_input"]: ValueTypes["moves_pk_columns_input"];
  ["moves_select_column"]: ValueTypes["moves_select_column"];
  ["moves_set_input"]: ValueTypes["moves_set_input"];
  ["moves_stream_cursor_input"]: ValueTypes["moves_stream_cursor_input"];
  ["moves_stream_cursor_value_input"]: ValueTypes["moves_stream_cursor_value_input"];
  ["moves_update_column"]: ValueTypes["moves_update_column"];
  ["moves_updates"]: ValueTypes["moves_updates"];
  ["order_by"]: ValueTypes["order_by"];
  ["timestamptz"]: ValueTypes["timestamptz"];
  ["timestamptz_comparison_exp"]: ValueTypes["timestamptz_comparison_exp"];
  ["user_bool_exp"]: ValueTypes["user_bool_exp"];
  ["user_constraint"]: ValueTypes["user_constraint"];
  ["user_insert_input"]: ValueTypes["user_insert_input"];
  ["user_obj_rel_insert_input"]: ValueTypes["user_obj_rel_insert_input"];
  ["user_on_conflict"]: ValueTypes["user_on_conflict"];
  ["user_order_by"]: ValueTypes["user_order_by"];
  ["user_pk_columns_input"]: ValueTypes["user_pk_columns_input"];
  ["user_select_column"]: ValueTypes["user_select_column"];
  ["user_set_input"]: ValueTypes["user_set_input"];
  ["user_stream_cursor_input"]: ValueTypes["user_stream_cursor_input"];
  ["user_stream_cursor_value_input"]: ValueTypes["user_stream_cursor_value_input"];
  ["user_update_column"]: ValueTypes["user_update_column"];
  ["user_updates"]: ValueTypes["user_updates"];
  ["uuid"]: ValueTypes["uuid"];
  ["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
};
