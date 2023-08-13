process.env = {
    ...process.env,
    __NEXT_IMAGE_OPTS: {
        deviceSizes: [320, 420, 768, 1024, 1200],
        imageSizes: [],
        domains: ['blog.kochie.io'],
        path: '/_next/image',
        loader: 'default',
    },
};

import {jest} from '@jest/globals';
import Image from 'next/image';

jest.unstable_mockModule('next/image', () => (Image));