// --------------------------------------------------------------------------------
// Type Helpers
// --------------------------------------------------------------------------------

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };


// --------------------------------------------------------------------------------
// Enums
// --------------------------------------------------------------------------------

/** An enum describing what kind of type a given `__Type` is. */
export const TypeKind = Object.freeze({
  /** Indicates this type is a scalar. */
  SCALAR: 'SCALAR',
  /** Indicates this type is an object. `fields` and `interfaces` are valid fields. */
  OBJECT: 'OBJECT',
  /** Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields. */
  INTERFACE: 'INTERFACE',
  /** Indicates this type is a union. `possibleTypes` is a valid field. */
  UNION: 'UNION',
  /** Indicates this type is an enum. `enumValues` is a valid field. */
  ENUM: 'ENUM',
  /** Indicates this type is an input object. `inputFields` is a valid field. */
  INPUT_OBJECT: 'INPUT_OBJECT',
  /** Indicates this type is a list. `ofType` is a valid field. */
  LIST: 'LIST',
  /** Indicates this type is a non-null. `ofType` is a valid field. */
  NON_NULL: 'NON_NULL'
} as const);
export type TypeKind = 'SCALAR' | 'OBJECT' | 'INTERFACE' | 'UNION' | 'ENUM' | 'INPUT_OBJECT' | 'LIST' | 'NON_NULL';


// --------------------------------------------------------------------------------
// Object Types
// --------------------------------------------------------------------------------

/** The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.

Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types. */
type __Type = '__Type';


// --------------------------------------------------------------------------------
// Fragments
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment fullType on __Type {
 *   kind
 *   name
 *   fields(includeDeprecated: true) {
 *     name
 *     args {
 *       name
 *       type {
 *         ...typeRef
 *       }
 *       defaultValue
 *     }
 *     type {
 *       ...typeRef
 *     }
 *     isDeprecated
 *     deprecationReason
 *   }
 *   enumValues(includeDeprecated: true) {
 *     name
 *   }
 *   possibleTypes {
 *     ...typeRef
 *   }
 * }
 * ```
 */
export type FullTypeFragment = {
  enumValues?: {
    name: string;
  }[];
  fields?: {
    args: {
      /** A GraphQL-formatted string representing the default value for this input value. */
      defaultValue?: string;
      name: string;
      type: TypeRefFragment;
    }[];
    deprecationReason?: string;
    isDeprecated: boolean;
    name: string;
    type: TypeRefFragment;
  }[];
  kind: TypeKind;
  name?: string;
  possibleTypes?: TypeRefFragment[];
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment schemaQueryTypeName on Query {
 *   __schema {
 *     queryType {
 *       name
 *     }
 *   }
 * }
 * ```
 */
export type SchemaQueryTypeNameFragment = {
  /** Access the current type schema of this server. */
  __schema: {
    /** The type that query operations will be rooted at. */
    queryType: {
      name?: string;
    };
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * fragment typeRef on __Type {
 *   kind
 *   name
 *   ofType {
 *     kind
 *     name
 *   }
 * }
 * ```
 */
export type TypeRefFragment = {
  kind: TypeKind;
  name?: string;
  ofType?: {
    kind: TypeKind;
    name?: string;
  };
};


// --------------------------------------------------------------------------------
// Operations
// --------------------------------------------------------------------------------

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query rootFragment {
 *   ...schemaQueryTypeName
 * }
 * ```
 */
export type RootFragmentQuery = {
  /** Access the current type schema of this server. */
  __schema: {
    /** The type that query operations will be rooted at. */
    queryType: {
      name?: string;
    };
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query schemaTypes {
 *   __schema {
 *     queryType {
 *       name
 *     }
 *     mutationType {
 *       name
 *     }
 *     types {
 *       ...fullType
 *     }
 *     directives {
 *       name
 *       args {
 *         name
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type SchemaTypesQuery = {
  /** Access the current type schema of this server. */
  __schema: {
    /** A list of all directives supported by this server. */
    directives: {
      args: {
        name: string;
      }[];
      name: string;
    }[];
    /** If this server supports mutation, the type that mutation operations will be rooted at. */
    mutationType?: {
      name?: string;
    };
    /** The type that query operations will be rooted at. */
    queryType: {
      name?: string;
    };
    /** A list of all types supported by this server. */
    types: FullTypeFragment[];
  };
};

/**
 * @see {@link file://./test.graphql}
 * 
 * @example
 * ```graphql
 * query typeByName($name: String!) {
 *   __type(name: $name) {
 *     __typename
 *     kind
 *     name
 *     ofType {
 *       ...typeRef
 *     }
 *   }
 *   user: __type(name: "User") {
 *     name
 *   }
 * }
 * ```
 */
export type TypeByNameQuery = {
  /** Request the type information of a single type. */
  __type?: {
    __typename: __Type;
    kind: TypeKind;
    name?: string;
    ofType?: TypeRefFragment;
  };
  /** Request the type information of a single type. */
  user?: {
    name?: string;
  };
};


// --------------------------------------------------------------------------------
// Operation Variables
// --------------------------------------------------------------------------------

/** @see {@link file://./test.graphql} */
export type RootFragmentQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type SchemaTypesQueryVariables = Exact<{ [key: string]: never; }>;

/** @see {@link file://./test.graphql} */
export type TypeByNameQueryVariables = Exact<{
  name: string;
}>;