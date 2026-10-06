# EPUBCheck

`npm run verify:epub`은 SiteScout의 ZIP 및 의미 보존 회귀 테스트다. EPUB 표준 적합성은 W3C/DAISY의 공식 EPUBCheck로 별도 검사한다.

원본과 앱에서 export한 결과를 비교하려면 다음처럼 두 번째 EPUB 경로를 전달한다. 이 모드는 파일 전체 SHA가 아니라 spine/TOC/리소스/cover/CSS/링크/각주의 의미 보존을 비교한다.

```sh
npm run verify:epub -- fixtures/epub2-source.epub output/book.epub
```

1. Java 17 이상을 설치한다.
2. [공식 EPUBCheck 릴리스](https://github.com/w3c/epubcheck/releases)에서 배포 ZIP을 받아 압축을 푼다.
3. `epubcheck.jar`와 함께 배포된 `lib/` 디렉터리를 유지한다.
4. 다음 중 하나로 실행한다.

```sh
EPUBCHECK_JAR=/absolute/path/to/epubcheck.jar npm run verify:epubcheck -- path/to/book.epub
```

또는 `tools/epubcheck/epubcheck.jar`에 공식 배포본을 배치한다. JAR와 의존 라이브러리는 저장소에 커밋하지 않는다.

CI에서는 Java 17을 설치한 뒤 `EPUBCHECK_JAR`를 설정하고, export된 EPUB 파일을 인수로 이 스크립트를 실행한다.
