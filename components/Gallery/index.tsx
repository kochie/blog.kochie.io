import React from 'react'

import style from "./gallery.less"
import { Small, Medium, Large } from '../ArticleCards';

const image = {
    lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAYACgMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APl79kD4dfArUP2ZvEHxL1f4TeHrPxd9r8f3lpFo9z41/s3+yZPBmhQJp+5/H1lBbXL6K0Oh3OoyaRqd1d29pBd6lJqd89zPP/aFKLw08NTWBy+rTtzVJVOZzqzlKSnOfNQqO7hTpxShVpxjZ+zUN3/MuaYXH18RPkz/ADPDq8YwhRo4LkgqbuormpN8vtJVJ63b52pOUbRX573HxY8DG4nOs/DD4eX2sGaU6te3Pwy8O6zcXmpF2+3XVxq+qaz/AGnqs9xdebNLqWo/6dfSO11d/wCkSyV01KWCnUnN4SUXOcpOMMXiFCLk23GC5tIK9ororHbSw2YwpU4RzOrKMKcIqU6dFTkoxSUpKNFRUmleSilG97Kx/9k=",
    src: "/static/images/reflection.jpg",
    alt: "card example image"
}

export default () => {
    return (
        <div className={style.container}>
            <Large title="Test" image={image} blurb={"Hello"} tags={["spicy", "memes"]} readTime={2} />
            <Small title="Test" image={image} blurb={"Hello"} tags={["spicy", "memes"]} readTime={2} />
            <Small title="Test" image={image} blurb={"Hello"} tags={["spicy", "memes"]} readTime={2} />
            <Small title="Test" image={image} blurb={"Hello"} tags={["spicy", "memes"]} readTime={2} />
            <Medium title="Test" image={image} blurb={"Hello"} tags={["spicy", "memes"]} readTime={2} />
            <Medium title="Test" image={image} blurb={"Hello"} tags={["spicy", "memes"]} readTime={2} />
        </div>
    )
}