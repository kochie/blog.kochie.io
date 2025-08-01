export default {
  rules: {
    'meta-description-length': {
      create(context) {
        return {
          JSXAttribute(node) {
            console.log("node", node)
            if (
              node.name.name === 'content' &&
              node.parent.name.name === 'meta' &&
              node.parent.attributes.some(
                (attr) =>
                  attr.name.name === 'name' &&
                  attr.value.value === 'description'
              )
            ) {
              const description = node.value.value
              if (description.length < 50 || description.length > 160) {
                context.report({
                  node,
                  message:
                    'Meta description should be between 50-160 characters (current length: {{ length }})',
                  data: { length: description.length },
                })
              }
            }
          },
        }
      },
    },

    // OpenGraph Tags Completeness Rule
    'opengraph-tags-complete': {
      create(context) {
        return {
          JSXElement(node) {
            if (node.openingElement.name.name === 'Head') {
              const requiredOgTags = [
                'og:title',
                'og:description',
                'og:type',
                'og:image',
                'og:url',
              ]

              const presentOgTags = node.children
                .filter(
                  (child) =>
                    child.type === 'JSXElement' &&
                    child.openingElement.name.name === 'meta'
                )
                .map(
                  (metaNode) =>
                    metaNode.openingElement.attributes.find(
                      (attr) => attr.name.name === 'property'
                    )?.value.value
                )

              const missingTags = requiredOgTags.filter(
                (tag) => !presentOgTags.includes(tag)
              )

              if (missingTags.length > 0) {
                context.report({
                  node,
                  message: 'Missing OpenGraph tags: {{ tags }}',
                  data: { tags: missingTags.join(', ') },
                })
              }
            }
          },
        }
      },
    },

    // Page Title Length Rule
    'page-title-length': {
      create(context) {
        return {
          JSXElement(node) {
            if (node.openingElement.name.name === 'title') {
              const titleText = node.children[0]?.value?.trim() || ''
              if (titleText.length < 10 || titleText.length > 70) {
                context.report({
                  node,
                  message:
                    'Page title should be between 10-70 characters (current length: {{ length }})',
                  data: { length: titleText.length },
                })
              }
            }
          },
        }
      },
    },
  },
}
