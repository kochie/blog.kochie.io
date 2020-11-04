declare namespace Intl {
    interface RelativeListFormatOptions {
        localeMatcher: "lookup" | "best fit"
        type: "conjunction" | "disjunction"
        style: "long" | "short" | "narrow"
    }

    interface ListFormat {
        format(list: Iterable): string
    }

    const ListFormat: {
        new(
            locales?: BCP47LanguageTag | BCP47LanguageTag[],
            options?: RelativeListFormatOptions,
        ): ListFormat
    }
}