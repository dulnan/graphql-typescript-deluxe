import type {
  ComplexEdgeCasesQuery,
  IdentifiableFieldsFragment,
  ContentFieldsFragment,
  ArticleBasicFragment,
  ArticleDetailsFragment,
  PersonFullFragment,
  ImageFieldsFragment,
  SectionDeepFragment,
  TreeNodeRecursiveFragment,
  MediaUnionFieldsFragment,
  PageWithSectionsFragment,
  VideoFieldsFragment,
  PersonBasicFragment,
  ArticleMediaFragment,
} from './result'

export default function (query: ComplexEdgeCasesQuery): void {
  // ===== Test 1: Interface return with type narrowing =====
  const content = query.content
  if (!content) return

  // Base interface fields should be available on both types
  console.log(content.id)
  console.log(content.uuid)
  console.log(content.title)
  console.log(content.__typename)
  console.log(content.status)
  console.log(content.createdAt)
  console.log(content.updatedAt)

  // body is available on both Article and Page (via their respective fragments),
  // so TypeScript correctly allows accessing it without narrowing
  console.log(content.body)

  // Type narrowing via __typename
  if (content.__typename === 'Article') {
    console.log(content.body)
    console.log(content.author.name)
    console.log(content.author.email)
    console.log(content.tags)
    console.log(content.priority)
    if (content.contributors) {
      console.log(content.contributors[0]?.name)
      console.log(content.contributors[0]?.id)
    }
    if (content.media) {
      for (const m of content.media) {
        if (m.__typename === 'Image') {
          console.log(m.url)
          console.log(m.caption)
        }
      }
    }
  }

  if (content.__typename === 'Page') {
    console.log(content.body)
    if (content.parent) {
      console.log(content.parent.title)
      console.log(content.parent.__typename)
      if (content.parent.parent) {
        console.log(content.parent.parent.title)
      }
    }
    if (content.sections) {
      for (const section of content.sections) {
        console.log(section.heading)
      }
    }
  }

  // @ts-expect-error - Invalid __typename value
  if (content.__typename === 'InvalidType') {
    console.log('never')
  }

  // ===== Test 2: Union type exhaustive narrowing =====
  const media = query.media
  if (media) {
    if (media.__typename === 'Image') {
      console.log(media.url)
      console.log(media.width)
      console.log(media.height)
      console.log(media.caption)
      console.log(media.alt)
    } else if (media.__typename === 'Video') {
      console.log(media.url)
      console.log(media.duration)
      console.log(media.provider)
      if (media.thumbnail) {
        console.log(media.thumbnail.url)
        console.log(media.thumbnail.alt)
      }
    } else if (media.__typename === 'Document') {
      console.log(media.filename)
      console.log(media.mimeType)
      console.log(media.size)
      console.log(media.url)
    }

    if (media.__typename === 'Video') {
      // @ts-expect-error - width only on Image, not on Video
      console.log(media.width)
    }

    if (media.__typename === 'Image') {
      // @ts-expect-error - filename only on Document
      console.log(media.filename)
    }
  }

  // ===== Test 3: Recursive type access =====
  const tree = query.tree
  if (tree) {
    console.log(tree.id)
    console.log(tree.label)

    // First level children
    if (tree.children[0]) {
      console.log(tree.children[0].id)
      console.log(tree.children[0].label)

      // Second level children
      if (tree.children[0].children[0]) {
        console.log(tree.children[0].children[0].id)
        console.log(tree.children[0].children[0].label)

        // Third level children
        if (tree.children[0].children[0].children[0]) {
          console.log(tree.children[0].children[0].children[0].id)
          console.log(tree.children[0].children[0].children[0].label)
        }
      }
    }

    // Metadata with nested structure
    if (tree.metadata) {
      console.log(tree.metadata.key)
      console.log(tree.metadata.value)

      // Nested metadata array
      if (tree.metadata.nested) {
        console.log(tree.metadata.nested[0]?.key)
        console.log(tree.metadata.nested[0]?.value)
      }

      // Nested array [[String!]] - tags is (string[] | null)[]
      if (tree.metadata.tags) {
        const firstTagArray = tree.metadata.tags[0]
        if (firstTagArray) {
          console.log(firstTagArray[0])
        }
      }
    }
  }

  // ===== Test 4: Search result with nested narrowing =====
  const search = query.search
  console.log(search.total)

  for (const item of search.items) {
    // Base fields from contentFields fragment
    console.log(item.title)
    console.log(item.status)
    console.log(item.__typename)

    if (item.__typename === 'Article') {
      console.log(item.excerpt)
      console.log(item.priority)
      if (item.category) {
        console.log(item.category.label)
        if (item.category.parent) {
          console.log(item.category.parent.label)
        }
      }
    }

    if (item.__typename === 'Page') {
      if (item.sections) {
        for (const section of item.sections) {
          console.log(section.id)
          console.log(section.heading)

          // Union type within section content
          if (section.content) {
            if (section.content.__typename === 'TextBlock') {
              console.log(section.content.html)
              console.log(section.content.plain)
            } else if (section.content.__typename === 'ImageGallery') {
              console.log(section.content.layout)
              for (const img of section.content.images) {
                console.log(img.url)
              }
            } else if (section.content.__typename === 'VideoEmbed') {
              console.log(section.content.autoplay)
              console.log(section.content.video.url)
            } else if (section.content.__typename === 'CodeBlock') {
              console.log(section.content.code)
              console.log(section.content.language)
            }
          }
        }
      }
    }
  }

  // Facets
  if (search.facets) {
    for (const status of search.facets.statuses) {
      console.log(status.value)
      console.log(status.count)
    }
    for (const author of search.facets.authors) {
      console.log(author.value)
      console.log(author.count)
    }
  }

  // ===== Test 5: Article with merged fragments =====
  const article = query.article
  if (article) {
    // From articleBasic fragment
    console.log(article.id)
    console.log(article.title)
    console.log(article.status)
    console.log(article.excerpt)
    console.log(article.__typename)

    // From articleDetails fragment
    console.log(article.body)
    console.log(article.tags)
    console.log(article.priority)

    // Author with merged fragments (personBasic + personFull)
    console.log(article.author.name)
    console.log(article.author.id)
    console.log(article.author.email)
    if (article.author.avatar) {
      console.log(article.author.avatar.url)
      console.log(article.author.avatar.alt)
    }

    // Category from articleDetails
    if (article.category) {
      console.log(article.category.label)
      if (article.category.metadata) {
        console.log(article.category.metadata.key)
        console.log(article.category.metadata.value)
      }
    }

    // From articleMedia (conditional @include)
    if (article.media) {
      for (const m of article.media) {
        if (m.__typename === 'Image') {
          console.log(m.caption)
          console.log(m.width)
        } else if (m.__typename === 'Video') {
          console.log(m.duration)
        } else if (m.__typename === 'Document') {
          console.log(m.filename)
        }
      }
    }
  }

  // ===== Test 6: Deep nesting in allContent =====
  const allContent = query.allContent
  for (const c of allContent) {
    console.log(c.__typename)

    if (c.__typename === 'Article') {
      if (c.relatedContent) {
        for (const related of c.relatedContent) {
          console.log(related.title)
          console.log(related.__typename)

          if (related.__typename === 'Article') {
            // Deep nested author avatar
            if (related.author.avatar) {
              console.log(related.author.avatar.url)
              console.log(related.author.avatar.alt)
              console.log(related.author.avatar.width)
              console.log(related.author.avatar.height)
            }

            // Deep nested media union
            if (related.media) {
              for (const m of related.media) {
                if (m.__typename === 'Image') {
                  console.log(m.url)
                  console.log(m.caption)
                } else if (m.__typename === 'Video') {
                  if (m.thumbnail) {
                    console.log(m.thumbnail.url)
                    console.log(m.thumbnail.alt)
                  }
                } else if (m.__typename === 'Document') {
                  // Document has no additional fields selected in this query
                  console.log(m.__typename)
                }
              }
            }
          }
        }
      }
    }
  }

  // ===== Test 7: 'in' operator narrowing =====
  if (content && 'body' in content) {
    // After 'in' check, body should be accessible
    console.log(content.body)
  }

  if (content && 'sections' in content) {
    // After 'in' check for Page-specific field
    if (content.sections) {
      console.log(content.sections[0]?.heading)
    }
  }

  // ===== Test 8: Optional chaining with fragments =====
  console.log(article?.author?.avatar?.url)
  console.log(article?.category?.metadata?.value)

  // ===== Test 9: Fragment type standalone usage =====
  const testIdentifiable: IdentifiableFieldsFragment = {
    id: '123',
    uuid: 'abc-123',
  }
  console.log(testIdentifiable.id)

  const testContent: ContentFieldsFragment = {
    title: 'Test',
    status: 'DRAFT',
  }
  console.log(testContent.title)

  const testArticleBasic: ArticleBasicFragment = {
    __typename: 'Article',
    id: '1',
    title: 'Test',
    status: 'PUBLISHED',
    excerpt: 'Test excerpt',
  }
  console.log(testArticleBasic.excerpt)

  const testImage: ImageFieldsFragment = {
    id: '1',
    url: 'https://example.com/image.jpg',
    alt: 'Test image',
    width: 100,
    height: 100,
    caption: 'Test caption',
  }
  console.log(testImage.caption)

  const testVideo: VideoFieldsFragment = {
    id: '1',
    url: 'https://example.com/video.mp4',
    duration: 120,
    provider: 'youtube',
  }
  console.log(testVideo.duration)

  const testPersonBasic: PersonBasicFragment = {
    id: '1',
    name: 'John Doe',
  }
  console.log(testPersonBasic.name)

  const testPersonFull: PersonFullFragment = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: {
      url: 'https://example.com/avatar.jpg',
      alt: 'Avatar',
    },
  }
  console.log(testPersonFull.email)

  // ===== Test 10: Section deep fragment with union content =====
  const testSection: SectionDeepFragment = {
    id: '1',
    heading: 'Test Section',
    content: {
      __typename: 'TextBlock',
      html: '<p>Test</p>',
      plain: 'Test',
    },
    subsections: [
      {
        id: '2',
        heading: 'Subsection',
        content: {
          __typename: 'TextBlock',
          html: '<p>Sub</p>',
        },
      },
    ],
  }
  console.log(testSection.heading)
  if (testSection.content?.__typename === 'TextBlock') {
    console.log(testSection.content.html)
  }

  // ===== Test 11: TreeNode recursive fragment =====
  const testTree: TreeNodeRecursiveFragment = {
    id: '1',
    label: 'Root',
    children: [
      {
        id: '2',
        label: 'Child 1',
        children: [
          {
            id: '3',
            label: 'Grandchild',
            children: [
              {
                id: '4',
                label: 'Great-grandchild',
              },
            ],
          },
        ],
      },
    ],
    metadata: {
      key: 'test',
      value: 'value',
      nested: [{ key: 'nested', value: 'nested-value' }],
      tags: [['tag1', 'tag2'], null, ['tag3']],
    },
  }
  console.log(testTree.children[0]?.children[0]?.children[0]?.label)

  // ===== Test 12: Page with sections fragment =====
  const testPage: PageWithSectionsFragment = {
    body: 'Page body',
    sections: [testSection],
    children: [
      {
        title: 'Child page',
        sections: [
          {
            id: '1',
            heading: 'Child section',
          },
        ],
      },
    ],
  }
  console.log(testPage.children?.[0]?.sections?.[0]?.heading)

  // ===== Test 13: Article details fragment =====
  const testArticleDetails: ArticleDetailsFragment = {
    body: 'Article body',
    tags: ['tag1', 'tag2'],
    priority: 'HIGH',
    author: {
      id: '1',
      name: 'Author',
      email: 'author@example.com',
      avatar: {
        url: 'https://example.com/avatar.jpg',
        alt: 'Avatar',
      },
    },
    category: {
      label: 'Category',
      metadata: {
        key: 'meta',
        value: 'value',
      },
    },
  }
  console.log(testArticleDetails.author.email)

  // ===== Test 14: Media union fields fragment =====
  const testMediaImage: MediaUnionFieldsFragment = {
    id: '1',
    url: 'https://example.com/image.jpg',
    alt: 'Test',
    width: 100,
    height: 100,
    caption: 'Caption',
  }
  console.log(testMediaImage.url)

  // ===== Test 15: Article media fragment =====
  const testArticleMedia: ArticleMediaFragment = {
    media: [
      {
        __typename: 'Image',
        id: '1',
        url: 'https://example.com/image.jpg',
        alt: 'Test',
        width: 100,
        height: 100,
        caption: 'Caption',
      },
      {
        __typename: 'Video',
        id: '2',
        url: 'https://example.com/video.mp4',
        duration: 120,
        provider: 'youtube',
      },
      {
        __typename: 'Document',
        url: 'https://example.com/doc.pdf',
        filename: 'doc.pdf',
      },
    ],
  }
  if (testArticleMedia.media) {
    for (const m of testArticleMedia.media) {
      if (m.__typename === 'Image') {
        console.log(m.caption)
      }
    }
  }
}
