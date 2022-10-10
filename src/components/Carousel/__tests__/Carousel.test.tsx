import { create } from 'react-test-renderer'
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
  it('renders correctly', () => {
    const tree = create(<Carousel images={TEST_IMAGES} />)

    expect(tree.toJSON()).toMatchSnapshot()
  })
})
