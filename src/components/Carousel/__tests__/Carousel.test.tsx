import { act, create, ReactTestRenderer } from 'react-test-renderer'
import Carousel from '..'

const TEST_IMAGES = [
  {
    src: '/articles-source/03-travel-chaos/IMG_1929.PNG',
    alt: 'Patrick Campanale',
  },
  {
    src: '/articles-source/03-travel-chaos/IMG_1930.PNG',
    alt: 'Patrick Campanale',
  },
  {
    src: '/articles-source/03-travel-chaos/IMG_1931.PNG',
    alt: 'Patrick Campanale',
  },
  {
    src: '/articles-source/03-travel-chaos/IMG_1932.PNG',
    alt: 'Patrick Campanale',
  },
]

describe('Carousel Component', () => {
  it('renders correctly', async () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Carousel maxWidth={200} images={TEST_IMAGES} />, {
        createNodeMock(element) {
          if (element.type === 'div') return { clientWidth: 100 }
        },
      })
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('maxWidth should limit the carousel size', async () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<Carousel maxWidth={200} images={TEST_IMAGES} />, {
        createNodeMock(element) {
          if (element.type === 'div') return { clientWidth: 300 }
        },
      })
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()

    // @ts-expect-error tree will be assigned
    const images = tree.root.findAll((node) => node.type === 'img')
    expect(images.map((img) => img.props.width)).toEqual([200, 200, 200, 200])
  })
})
