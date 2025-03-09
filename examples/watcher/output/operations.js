const c = `fragment articleOne on NodeArticle{title tags categories{url}}`;
const d = `fragment articleTwo on NodeArticle{title categories{label}}`;
const a = `fragment category on Category{url label renamedLabel:label related{...on NodeArticle{title tags}}}`;
const b = `fragment randomEntity on Entity{id entityType ...on NodePage{title body}}`;

export const operations = {
  query: {
    'fieldMerging': `query fieldMerging{getRandomEntity{__typename ...articleOne ...articleTwo ...on NodeArticle{id}}}` + c + d,
    'loadEntity': `query loadEntity{getRandomEntity{...randomEntity}}` + b,
    'myQuery': `query myQuery{getRandomEntity{id ...on NodeArticle{categories{label url}}}}`,
    'queryWithVariables': `query queryWithVariables($skipCategories:Boolean=false){getRandomEntity{...on NodeArticle{categories@skip(if:$skipCategories){...category}}}}` + a,
  },
  mutation: {
    
  },
  subscription: {
    
  }
}