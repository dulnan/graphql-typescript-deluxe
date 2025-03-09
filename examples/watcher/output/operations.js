const a = `fragment articleOne on NodeArticle{title tags categories{url}}`;
const b = `fragment articleTwo on NodeArticle{title categories{label}}`;
const c = `fragment category on Category{url label renamedLabel:label related{...on NodeArticle{title tags}}}`;
const d = `fragment randomEntity on Entity{id entityType ...on NodePage{title body}}`;

export const operations = {
  query: {
    'fieldMerging': `query fieldMerging{getRandomEntity{__typename ...articleOne ...articleTwo ...on NodeArticle{id}}}` + a + b,
    'loadEntity': `query loadEntity{getRandomEntity{...randomEntity}}` + d,
    'myQuery': `query myQuery{getRandomEntity{id ...on NodeArticle{categories{label url}}}}`,
    'queryWithVariables': `query queryWithVariables($skipCategories:Boolean=false){getRandomEntity{...on NodeArticle{categories@skip(if:$skipCategories){...category}}}}` + c,
  },
  mutation: {
    
  },
  subscription: {
    
  }
}