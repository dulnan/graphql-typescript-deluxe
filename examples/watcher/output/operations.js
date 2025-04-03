const a = String.raw`fragment articleOne on NodeArticle{title tags categories{url}}`;
const b = String.raw`fragment articleTwo on NodeArticle{title categories{label}}`;
const c = String.raw`fragment category on Category{url label renamedLabel:label related{...on NodeArticle{title tags}}}`;
const d = String.raw`fragment randomEntity on Entity{id entityType ...on NodePage{title body}}`;

export const operations = {
  query: {
    'fieldMerging': String.raw`query fieldMerging{getRandomEntity{__typename ...articleOne ...articleTwo ...on NodeArticle{id}}}` + a + b,
    'loadEntity': String.raw`query loadEntity{getRandomEntity{...randomEntity}}` + d,
    'myQuery': String.raw`query myQuery{getRandomEntity{id ...on NodeArticle{categories{label url}}}}`,
    'queryWithVariables': String.raw`query queryWithVariables($skipCategories:Boolean=false){getRandomEntity{...on NodeArticle{categories@skip(if:$skipCategories){...category}}}}` + c,
  },
  mutation: {
    
  },
  subscription: {
    
  }
}