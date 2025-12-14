import type {
  TwoFragmentsDifferentArraySelectionsQuery,
  ThreeFragmentsSameNestedFieldQuery,
  NestedObjectDifferentSelectionsQuery,
  DeepNestingOverlapQuery,
  InterfaceFragmentsOverlapQuery,
  InlineAndFragmentOverlapQuery,
  UnionWithOverlappingFragmentsQuery,
  ProductMultipleOverlapsQuery,
  DeeplyNestedImageOverlapQuery,
  PageSectionsOverlapQuery,
  InterfaceOnConcreteOverlapQuery,
  MultipleInlineOverlapQuery,
  FragmentSpreadingFragmentQuery,
  AllContentOverlapQuery,
  ProductReviewsOverlapQuery,
  InterfacePartialCoverageQuery,
  UnionPartialCoverageQuery,
  InterfaceSingleFragmentPartialQuery,
  AllContentMixedCoverageQuery,
  InterfaceFragmentPlusConcreteOverlapQuery,
  UnionWithInterfaceFragmentQuery,
  DeepPartialCoverageQuery,
  InterfaceOverlapPlusMinimalInlineQuery,
  NestedUnionPartialCoverageQuery,
  AllContentInlineOnlyQuery,
  NoTypenamePartialCoverageQuery,
  NoTypenameUnionPartialQuery,
  NoTypenameSingleFragmentQuery,
  NoTypenameOverlapWithObjectQuery,
  NoTypenameAllContentPartialQuery,
} from './result'

export default function (
  q1: TwoFragmentsDifferentArraySelectionsQuery,
  q2: ThreeFragmentsSameNestedFieldQuery,
  q3: NestedObjectDifferentSelectionsQuery,
  q4: DeepNestingOverlapQuery,
  q5: InterfaceFragmentsOverlapQuery,
  q6: InlineAndFragmentOverlapQuery,
  q7: UnionWithOverlappingFragmentsQuery,
  q8: ProductMultipleOverlapsQuery,
  q9: DeeplyNestedImageOverlapQuery,
  q10: PageSectionsOverlapQuery,
  q11: InterfaceOnConcreteOverlapQuery,
  q12: MultipleInlineOverlapQuery,
  q13: FragmentSpreadingFragmentQuery,
  q14: AllContentOverlapQuery,
  q15: ProductReviewsOverlapQuery,
  q16: InterfacePartialCoverageQuery,
  q17: UnionPartialCoverageQuery,
  q18: InterfaceSingleFragmentPartialQuery,
  q19: AllContentMixedCoverageQuery,
  q20: InterfaceFragmentPlusConcreteOverlapQuery,
  q21: UnionWithInterfaceFragmentQuery,
  q22: DeepPartialCoverageQuery,
  q23: InterfaceOverlapPlusMinimalInlineQuery,
  q24: NestedUnionPartialCoverageQuery,
  q25: AllContentInlineOnlyQuery,
  q26: NoTypenamePartialCoverageQuery,
  q27: NoTypenameUnionPartialQuery,
  q28: NoTypenameSingleFragmentQuery,
  q29: NoTypenameOverlapWithObjectQuery,
  q30: NoTypenameAllContentPartialQuery,
): void {
  // =========================================================================
  // Test 1: Two fragments with different array selections
  // tags should have merged fields from both fragments: id, name, slug, color
  // =========================================================================
  const article1 = q1.article
  if (article1) {
    // Fields from articleTags fragment
    console.log(article1.title)
    // Fields from articleTagsExtended fragment
    console.log(article1.body)

    // Tags should have all fields from both fragments merged
    if (article1.tags) {
      for (const tag of article1.tags) {
        console.log(tag.id) // from articleTags
        console.log(tag.name) // from articleTags
        console.log(tag.slug) // from articleTagsExtended
        console.log(tag.color) // from articleTagsExtended (nullable)
      }
    }
  }

  // =========================================================================
  // Test 2: Three fragments all selecting same nested field differently
  // comments should have all fields merged: id, text, author, likes, replies
  // =========================================================================
  const article2 = q2.article
  if (article2) {
    console.log(article2.title) // from articleCommentsBasic
    console.log(article2.excerpt) // from articleCommentsWithAuthor
    console.log(article2.body) // from articleCommentsWithReplies

    if (article2.comments) {
      for (const comment of article2.comments) {
        console.log(comment.id) // from articleCommentsBasic
        console.log(comment.text) // from articleCommentsBasic
        console.log(comment.likes) // from articleCommentsWithReplies

        // author from articleCommentsWithAuthor
        if (comment.author) {
          console.log(comment.author.name)
        }

        // replies from articleCommentsWithReplies
        if (comment.replies) {
          for (const reply of comment.replies) {
            console.log(reply.id)
            console.log(reply.text)
          }
        }
      }
    }
  }

  // =========================================================================
  // Test 3: Nested objects (not arrays) with different selections
  // author should have merged fields: id, name, email, avatar
  // =========================================================================
  const article3 = q3.article
  if (article3) {
    console.log(article3.title) // from articleAuthorBasic
    console.log(article3.body) // from articleAuthorWithAvatar

    if (article3.author) {
      console.log(article3.author.id) // from articleAuthorBasic
      console.log(article3.author.name) // from articleAuthorBasic
      console.log(article3.author.email) // from articleAuthorWithAvatar

      // avatar from articleAuthorWithAvatar
      if (article3.author.avatar) {
        console.log(article3.author.avatar.url)
        console.log(article3.author.avatar.alt)
      }
    }
  }

  // =========================================================================
  // Test 4: Deep nesting - overlapping at multiple levels
  // category should have merged fields, and children should have merged fields too
  // =========================================================================
  const article4 = q4.article
  if (article4) {
    console.log(article4.title) // from articleCategoryBasic
    console.log(article4.excerpt) // from articleCategoryDeep

    if (article4.category) {
      console.log(article4.category.id) // from articleCategoryBasic
      console.log(article4.category.name) // from articleCategoryBasic
      console.log(article4.category.slug) // from articleCategoryDeep

      // children has different selections in both fragments
      if (article4.category.children) {
        for (const child of article4.category.children) {
          console.log(child.id) // from articleCategoryBasic
          console.log(child.name) // from articleCategoryDeep

          // nested children from articleCategoryDeep
          if (child.children) {
            for (const grandchild of child.children) {
              console.log(grandchild.id)
              console.log(grandchild.name)
            }
          }
        }
      }
    }
  }

  // =========================================================================
  // Test 5: Interface with fragments - overlapping nested on interface field
  // =========================================================================
  const content5 = q5.content
  if (content5) {
    console.log(content5.__typename)
    console.log(content5.id) // from contentTagsBasic
    console.log(content5.title) // from contentTagsExtended

    // tags should have merged fields from both fragments
    if (content5.tags) {
      for (const tag of content5.tags) {
        console.log(tag.id) // from contentTagsBasic
        console.log(tag.name) // from contentTagsBasic
        console.log(tag.slug) // from contentTagsExtended
        console.log(tag.description) // from contentTagsExtended
      }
    }
  }

  // =========================================================================
  // Test 6: Inline fragment + fragment spread with overlap
  // =========================================================================
  const article6 = q6.article
  if (article6) {
    console.log(article6.id) // from articleTagsBasic
    console.log(article6.title) // from articleTagsBasic

    // tags merged from fragment and inline fragment
    if (article6.tags) {
      for (const tag of article6.tags) {
        console.log(tag.id) // from articleTagsBasic fragment
        console.log(tag.name) // from articleTagsBasic fragment
        console.log(tag.color) // from inline fragment
        console.log(tag.description) // from inline fragment
      }
    }
  }

  // =========================================================================
  // Test 7: Union type with overlapping selections per member
  // =========================================================================
  const results7 = q7.search
  for (const result of results7) {
    console.log(result.__typename)

    if (result.__typename === 'Article') {
      console.log(result.title) // from searchArticleOne
      console.log(result.excerpt) // from searchArticleTwo

      // tags merged from both Article fragments
      if (result.tags) {
        for (const tag of result.tags) {
          console.log(tag.id) // from searchArticleOne
          console.log(tag.name) // from searchArticleOne
          console.log(tag.slug) // from searchArticleTwo
        }
      }
    }

    if (result.__typename === 'Product') {
      console.log(result.name) // from searchProductOne
      console.log(result.price) // from searchProductTwo

      // images merged from both Product fragments
      if (result.images) {
        for (const image of result.images) {
          console.log(image.url) // from searchProductOne
          console.log(image.alt) // from searchProductTwo
          console.log(image.width) // from searchProductTwo
        }
      }
    }

    // Page is not covered by any fragment, should be empty object or just __typename
    if (result.__typename === 'Page') {
      // No additional fields selected for Page
    }
  }

  // =========================================================================
  // Test 8: Product with multiple nested arrays all overlapping
  // =========================================================================
  const product8 = q8.product
  if (product8) {
    console.log(product8.id) // from productCategoriesBasic
    console.log(product8.name) // from multiple fragments
    console.log(product8.price) // from productImagesExtended

    // images merged from productImagesBasic and productImagesExtended
    if (product8.images) {
      for (const image of product8.images) {
        console.log(image.id) // from productImagesBasic
        console.log(image.url) // from productImagesBasic
        console.log(image.alt) // from productImagesExtended
        console.log(image.caption) // from productImagesExtended
      }
    }

    // categories merged from productCategoriesBasic and productCategoriesExtended
    if (product8.categories) {
      for (const category of product8.categories) {
        console.log(category.id) // from productCategoriesBasic
        console.log(category.name) // from productCategoriesBasic
        console.log(category.slug) // from productCategoriesExtended

        // parent from productCategoriesExtended
        if (category.parent) {
          console.log(category.parent.id)
          console.log(category.parent.name)
        }
      }
    }
  }

  // =========================================================================
  // Test 9: Deeply nested with image field overlapping at leaf
  // =========================================================================
  const product9 = q9.product
  if (product9) {
    console.log(product9.name) // from productVariantsBasic
    console.log(product9.price) // from productVariantsWithImage

    // variants merged from both fragments
    if (product9.variants) {
      for (const variant of product9.variants) {
        console.log(variant.id) // from productVariantsBasic
        console.log(variant.name) // from productVariantsBasic
        console.log(variant.sku) // from productVariantsBasic
        console.log(variant.price) // from productVariantsWithImage

        // image from productVariantsWithImage
        if (variant.image) {
          console.log(variant.image.url)
          console.log(variant.image.alt)
        }
      }
    }
  }

  // =========================================================================
  // Test 10: Page with recursive sections having overlapping nested
  // =========================================================================
  const page10 = q10.page
  if (page10) {
    console.log(page10.title) // from pageSectionsBasic
    console.log(page10.body) // from pageSectionsWithImage

    // sections merged from both fragments
    if (page10.sections) {
      for (const section of page10.sections) {
        console.log(section.id) // from pageSectionsBasic
        console.log(section.heading) // from pageSectionsBasic
        console.log(section.content) // from pageSectionsWithImage

        // image from pageSectionsWithImage
        if (section.image) {
          console.log(section.image.url)
        }

        // subsections merged from both fragments
        if (section.subsections) {
          for (const subsection of section.subsections) {
            console.log(subsection.id) // from pageSectionsBasic
            console.log(subsection.heading) // from pageSectionsWithImage
            console.log(subsection.content) // from pageSectionsWithImage
          }
        }
      }
    }
  }

  // =========================================================================
  // Test 11: Interface field on concrete type with concrete fragment overlap
  // =========================================================================
  const article11 = q11.article
  if (article11) {
    console.log(article11.id) // from articleWithContentTags
    console.log(article11.title) // from articleWithContentTags
    console.log(article11.body) // from articleExtraTags

    // tags merged from both fragments
    if (article11.tags) {
      for (const tag of article11.tags) {
        console.log(tag.id) // from articleWithContentTags
        console.log(tag.name) // from articleExtraTags
        console.log(tag.slug) // from articleExtraTags
      }
    }
  }

  // =========================================================================
  // Test 12: Multiple inline fragments with overlap (no named fragments)
  // =========================================================================
  const content12 = q12.content
  if (content12) {
    console.log(content12.__typename)

    if (content12.__typename === 'Article') {
      console.log(content12.title) // from first inline fragment
      console.log(content12.body) // from second inline fragment

      // tags merged from both inline fragments
      if (content12.tags) {
        for (const tag of content12.tags) {
          console.log(tag.id) // from first inline
          console.log(tag.name) // from first inline
          console.log(tag.slug) // from second inline
        }
      }
    }
  }

  // =========================================================================
  // Test 13: Fragment spreading another fragment, both with nested overlap
  // articleComplete spreads articleBase, both select author differently
  // =========================================================================
  const article13 = q13.article
  if (article13) {
    console.log(article13.id) // from articleBase
    console.log(article13.title) // from articleBase
    console.log(article13.body) // from articleComplete

    // author should have merged fields from articleBase and articleComplete
    if (article13.author) {
      console.log(article13.author.id) // from articleBase
      console.log(article13.author.name) // from articleBase
      console.log(article13.author.email) // from articleComplete
      console.log(article13.author.bio) // from articleComplete
    }
  }

  // =========================================================================
  // Test 14: All content with interface-level overlap
  // =========================================================================
  const allContent14 = q14.allContent
  for (const content of allContent14) {
    console.log(content.__typename)
    console.log(content.id) // from allContentTags
    console.log(content.title) // from allContentComments

    // tags merged from both fragments
    if (content.tags) {
      for (const tag of content.tags) {
        console.log(tag.id) // from allContentTags
        console.log(tag.name) // from allContentTags
        console.log(tag.slug) // from allContentComments
      }
    }

    // comments from allContentComments
    if (content.comments) {
      for (const comment of content.comments) {
        console.log(comment.id)
        console.log(comment.text)
      }
    }
  }

  // =========================================================================
  // Test 15: Review with nested author having avatar overlap
  // =========================================================================
  const product15 = q15.product
  if (product15) {
    console.log(product15.name) // from productReviewsBasic
    console.log(product15.price) // from productReviewsWithAuthorDetails

    // reviews merged from both fragments
    if (product15.reviews) {
      for (const review of product15.reviews) {
        console.log(review.id) // from productReviewsBasic
        console.log(review.rating) // from productReviewsBasic
        console.log(review.text) // from productReviewsBasic

        // author from productReviewsWithAuthorDetails
        if (review.author) {
          console.log(review.author.id)
          console.log(review.author.name)

          // avatar nested in author
          if (review.author.avatar) {
            console.log(review.author.avatar.url)
          }
        }
      }
    }
  }

  // =========================================================================
  // Test 16: Interface with partial coverage - produces | object
  // Only Article is covered, Page becomes object (needs narrowing)
  // =========================================================================
  const content16 = q16.content
  if (content16) {
    console.log(content16.__typename)

    // Must narrow to access Article-specific fields
    if (content16.__typename === 'Article') {
      console.log(content16.title) // from partialArticleTags
      console.log(content16.body) // from partialArticleTagsExtra

      // tags merged from both fragments
      if (content16.tags) {
        for (const tag of content16.tags) {
          console.log(tag.id) // from partialArticleTags
          console.log(tag.name) // from partialArticleTags
          console.log(tag.slug) // from partialArticleTagsExtra
        }
      }
    }

    // Page has __typename but no other fields selected
    if (content16.__typename === 'Page') {
      // Page only has __typename, no other fields
    }
  }

  // =========================================================================
  // Test 17: Union with partial coverage - Page becomes object
  // =========================================================================
  const results17 = q17.search
  for (const result of results17) {
    console.log(result.__typename)

    if (result.__typename === 'Article') {
      console.log(result.title) // from unionArticleOne
      console.log(result.excerpt) // from unionArticleTwo

      // tags merged
      if (result.tags) {
        for (const tag of result.tags) {
          console.log(tag.id)
          console.log(tag.name)
          console.log(tag.slug)
        }
      }
    }

    if (result.__typename === 'Product') {
      console.log(result.name)
      console.log(result.price)
    }

    // Page has __typename but no other fields selected
    if (result.__typename === 'Page') {
      // Page only has __typename, no other fields
    }
  }

  // =========================================================================
  // Test 18: Interface with single fragment (partial coverage)
  // Only Article covered via fragment, Page is object
  // =========================================================================
  const content18 = q18.content
  if (content18) {
    console.log(content18.__typename)

    // Need to narrow to Article to access fields
    if (content18.__typename === 'Article') {
      console.log(content18.title)
      console.log(content18.body)

      if (content18.tags) {
        for (const tag of content18.tags) {
          console.log(tag.id)
          console.log(tag.name)
        }
      }
    }

    // Page has __typename but no other fields selected
    if (content18.__typename === 'Page') {
      // Page only has __typename, no other fields
    }
  }

  // =========================================================================
  // Test 19: All content with only one type having overlap
  // Article has overlapping fragments (needs Omit), Page has simple inline
  // =========================================================================
  const allContent19 = q19.allContent
  for (const content of allContent19) {
    console.log(content.__typename)

    if (content.__typename === 'Article') {
      console.log(content.title) // from mixedArticleOne
      console.log(content.body) // from mixedArticleTwo

      // tags merged from both fragments
      if (content.tags) {
        for (const tag of content.tags) {
          console.log(tag.id)
          console.log(tag.name)
          console.log(tag.slug)
        }
      }
    }

    if (content.__typename === 'Page') {
      console.log(content.title) // from inline
    }
  }

  // =========================================================================
  // Test 20: Interface fragment + concrete inline with partial coverage
  // baseContentFields covers all (Content), inline adds extra for Article
  // =========================================================================
  const content20 = q20.content
  if (content20) {
    console.log(content20.__typename)
    console.log(content20.id) // from baseContentFields (all types)
    console.log(content20.title) // from baseContentFields (all types)

    // tags available on all types from baseContentFields
    // But Article has extra tag fields from inline, so needs narrowing for those
    if (content20.tags) {
      for (const tag of content20.tags) {
        console.log(tag.id) // from baseContentFields
        console.log(tag.name) // from baseContentFields
      }
    }

    if (content20.__typename === 'Article') {
      console.log(content20.body) // from inline

      // Article has extra tag fields
      if (content20.tags) {
        for (const tag of content20.tags) {
          console.log(tag.slug) // from inline (Article only)
          console.log(tag.color) // from inline (Article only)
        }
      }
    }
  }

  // =========================================================================
  // Test 21: Union with fragment on interface that some members implement
  // Article and Page implement Content, Product doesn't
  // =========================================================================
  const results21 = q21.search
  for (const result of results21) {
    console.log(result.__typename)

    // Article implements Content - has fragment fields
    if (result.__typename === 'Article') {
      console.log(result.id) // from searchContentFields
      console.log(result.title) // from searchContentFields

      if (result.tags) {
        for (const tag of result.tags) {
          console.log(tag.id)
          console.log(tag.name)
        }
      }
    }

    // Page implements Content - has fragment fields
    if (result.__typename === 'Page') {
      console.log(result.id) // from searchContentFields
      console.log(result.title) // from searchContentFields

      if (result.tags) {
        for (const tag of result.tags) {
          console.log(tag.id)
          console.log(tag.name)
        }
      }
    }

    // Product has its own inline selection
    if (result.__typename === 'Product') {
      console.log(result.name)
      console.log(result.price)
    }
  }

  // =========================================================================
  // Test 22: Deep partial coverage - nested with fragment overlap
  // =========================================================================
  const article22 = q22.article
  if (article22) {
    console.log(article22.title)

    if (article22.relatedArticles) {
      for (const related of article22.relatedArticles) {
        console.log(related.id) // from deepRelatedOne
        console.log(related.title) // from deepRelatedOne
        console.log(related.excerpt) // from deepRelatedTwo

        // tags merged from both fragments
        if (related.tags) {
          for (const tag of related.tags) {
            console.log(tag.id) // from deepRelatedOne
            console.log(tag.name) // from deepRelatedTwo
          }
        }
      }
    }
  }

  // =========================================================================
  // Test 23: Interface with overlapping fragments and inline for uncovered
  // Article has overlapping fragments, Page has simple inline
  // =========================================================================
  const content23 = q23.content
  if (content23) {
    console.log(content23.__typename)

    if (content23.__typename === 'Article') {
      console.log(content23.title) // from inlineOverlapArticleOne
      console.log(content23.body) // from inlineOverlapArticleTwo

      // comments merged from both fragments
      if (content23.comments) {
        for (const comment of content23.comments) {
          console.log(comment.id) // from inlineOverlapArticleOne
          console.log(comment.text) // from inlineOverlapArticleOne
          console.log(comment.likes) // from inlineOverlapArticleTwo

          if (comment.author) {
            console.log(comment.author.name) // from inlineOverlapArticleTwo
          }
        }
      }
    }

    if (content23.__typename === 'Page') {
      console.log(content23.title) // from inline
    }
  }

  // =========================================================================
  // Test 24: Nested with partial coverage at nested level
  // =========================================================================
  const article24 = q24.article
  if (article24) {
    console.log(article24.title)

    if (article24.author) {
      if (article24.author.articles) {
        for (const nested of article24.author.articles) {
          console.log(nested.id) // from nestedUnionArticleOne
          console.log(nested.title) // from nestedUnionArticleOne
          console.log(nested.excerpt) // from nestedUnionArticleTwo

          // category merged from both fragments
          if (nested.category) {
            console.log(nested.category.id) // from nestedUnionArticleOne
            console.log(nested.category.name) // from nestedUnionArticleTwo
            console.log(nested.category.slug) // from nestedUnionArticleTwo
          }
        }
      }
    }
  }

  // =========================================================================
  // Test 25: All content - no fragments, just interface-level inline
  // Should have | object for Page since only Article has inline
  // =========================================================================
  const allContent25 = q25.allContent
  for (const content of allContent25) {
    console.log(content.__typename)
    console.log(content.id) // interface level
    console.log(content.title) // interface level

    if (content.__typename === 'Article') {
      console.log(content.body) // from inline
      console.log(content.excerpt) // from inline
    }

    // Page only has interface-level fields (id, title, __typename)
    if (content.__typename === 'Page') {
      // body is Article-only, not available on Page
    }
  }

  // =========================================================================
  // Test 26: NO __typename - produces | object for uncovered types
  // Must use 'in' operator to narrow since no __typename
  // =========================================================================
  const content26 = q26.content
  if (content26) {
    // Without __typename, need to narrow using 'in' operator
    if ('title' in content26) {
      console.log(content26.title) // from noTypenameArticleOne
      console.log(content26.body) // from noTypenameArticleTwo

      // tags merged
      if (content26.tags) {
        for (const tag of content26.tags) {
          console.log(tag.id)
          console.log(tag.name)
        }
      }
    }

    // @ts-expect-error - Cannot access title without narrowing (could be object)
    console.log(content26.title)
  }

  // =========================================================================
  // Test 27: NO __typename - union with partial coverage
  // =========================================================================
  const results27 = q27.search
  for (const result of results27) {
    // Need to narrow using 'in' operator
    if ('title' in result) {
      // This is Article
      console.log(result.title)
      if (result.tags) {
        for (const tag of result.tags) {
          console.log(tag.id)
          console.log(tag.name)
        }
      }
    } else if ('name' in result) {
      // This is Product
      console.log(result.name)
      console.log(result.price)
    }

    // @ts-expect-error - Cannot access title without narrowing
    console.log(result.title)
  }

  // =========================================================================
  // Test 28: NO __typename - single fragment on interface
  // =========================================================================
  const content28 = q28.content
  if (content28) {
    // Need to narrow
    if ('id' in content28) {
      console.log(content28.id)
      console.log(content28.title)
      console.log(content28.body)
    }

    // @ts-expect-error - Cannot access without narrowing
    console.log(content28.title)
  }

  // =========================================================================
  // Test 29: NO __typename - overlapping fragments producing Omit + object
  // =========================================================================
  const content29 = q29.content
  if (content29) {
    if ('title' in content29) {
      console.log(content29.title)
      console.log(content29.excerpt)

      // comments merged from both fragments
      if (content29.comments) {
        for (const comment of content29.comments) {
          console.log(comment.id)
          console.log(comment.text)
          console.log(comment.likes)
          if (comment.author) {
            console.log(comment.author.name)
          }
        }
      }
    }

    // @ts-expect-error - Cannot access without narrowing
    console.log(content29.title)
  }

  // =========================================================================
  // Test 30: NO __typename - all content array with partial coverage
  // =========================================================================
  const allContent30 = q30.allContent
  for (const content of allContent30) {
    if ('id' in content) {
      console.log(content.id)
      console.log(content.title)

      if (content.tags) {
        for (const tag of content.tags) {
          console.log(tag.id)
          console.log(tag.name)
        }
      }
    }

    // @ts-expect-error - Cannot access without narrowing (could be object)
    console.log(content.id)
  }
}
