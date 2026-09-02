# [1.3.0](https://github.com/TwilioDevEd/message-segment-calculator/compare/v1.2.0...v1.3.0) (2026-09-02)


### Bug Fixes

* Add legacy runtime fallbacks for TextEncoder and globalThis ([8005f87](https://github.com/TwilioDevEd/message-segment-calculator/commit/8005f871024cd61851961fd9d188804625371a5d))
* Add no-var ESLint rule for test JS files, replace var with let ([848b953](https://github.com/TwilioDevEd/message-segment-calculator/commit/848b9535ae1bdcab92e1a92c78c5b5640e764798))
* Add npm start script for local development ([2cf222a](https://github.com/TwilioDevEd/message-segment-calculator/commit/2cf222a40a7217a1fba5a7fdf90e70b81efa1866))
* Address code review feedback ([bbf6198](https://github.com/TwilioDevEd/message-segment-calculator/commit/bbf61986ab48da28d63ef4ed82fbe2d1fefab1c6))
* Address Copilot review feedback ([4b3c845](https://github.com/TwilioDevEd/message-segment-calculator/commit/4b3c8459cb75ec0f70d7f573d2828bf65b7a3a8d))
* Address Copilot review, add husky + lint-staged, project config ([c14fc1c](https://github.com/TwilioDevEd/message-segment-calculator/commit/c14fc1cd562d0a537956f4baabb7e78d1f39af81))
* Address remaining Copilot review comments ([51a0c47](https://github.com/TwilioDevEd/message-segment-calculator/commit/51a0c479baac6391f97aedf28ec1b048d4b7c552))
* Correct char detail tooltip encoding for UCS-2 messages, update CI matrix ([40938d1](https://github.com/TwilioDevEd/message-segment-calculator/commit/40938d19152793fd7c9d5b63caec05625b76b2fa)), closes [#59](https://github.com/TwilioDevEd/message-segment-calculator/issues/59)
* Correct GSM extension character count in UCS-2 mode ([#61](https://github.com/TwilioDevEd/message-segment-calculator/issues/61)) ([004c2a5](https://github.com/TwilioDevEd/message-segment-calculator/commit/004c2a5093fcc130b7a4a2dae93a63e73dcadaf0)), closes [#57](https://github.com/TwilioDevEd/message-segment-calculator/issues/57)
* **deps:** Downgrade chalk from v5 to v4 for CommonJS compatibility ([8ec3e99](https://github.com/TwilioDevEd/message-segment-calculator/commit/8ec3e99532a4034ec29d90e72e5ebd1eef94539f))
* Drop Node 18 from CI matrix (lint-staged@16 requires >=20.17) ([5c9b0dc](https://github.com/TwilioDevEd/message-segment-calculator/commit/5c9b0dc58c50e921ae43335fca8ecd24a2051e6c))
* **encodedChar:** Triple accents ([30cb849](https://github.com/TwilioDevEd/message-segment-calculator/commit/30cb8490a450da8f491bdd358820e5201e0c51af))
* Handle real Twilio API JSON format for RCS rich content ([f52e867](https://github.com/TwilioDevEd/message-segment-calculator/commit/f52e8677723dd252ed8ae1a8c0a4c9abc6e151de))
* Hide segment tape for international RCS messages ([077b3fc](https://github.com/TwilioDevEd/message-segment-calculator/commit/077b3fc500fd020fb959263d562703d5fdb9b281))
* Make RCS billing note region-aware, drop Node 16 from CI, add charDetails tests ([4336943](https://github.com/TwilioDevEd/message-segment-calculator/commit/4336943f81f5e205a29592f6ccf7f0e57629205d))
* Polish RCS info note wording per review feedback ([f046e46](https://github.com/TwilioDevEd/message-segment-calculator/commit/f046e466d4d4ff4bb0d97b789341ca4241cef821))
* Remove shell prompt prefix from README command example ([43ea1ee](https://github.com/TwilioDevEd/message-segment-calculator/commit/43ea1ee7dcb50604e8b056852c40a909c087a140))
* Remove trailing newline in segmenter.ts (prettier lint) ([67c9a7c](https://github.com/TwilioDevEd/message-segment-calculator/commit/67c9a7c5eb3612c6b0b202866892cd7df5bf739b))
* Resolve all eslint errors in new source files ([eb669a7](https://github.com/TwilioDevEd/message-segment-calculator/commit/eb669a7521bf4699082a84dfd39a7c8262b79c44))
* Resolve high-severity Dependabot alerts (serialize-javascript, flatted) ([bf07b28](https://github.com/TwilioDevEd/message-segment-calculator/commit/bf07b282c72caac277f59d54871ecfbf176e5b46))
* Resolve prettier and prefer-template lint errors in renderer ([3bf951a](https://github.com/TwilioDevEd/message-segment-calculator/commit/3bf951afdca996047e3f5451b73920981c868b1b))
* Show meaningful remaining capacity and segment bar for international RCS ([2a9e845](https://github.com/TwilioDevEd/message-segment-calculator/commit/2a9e8454b19de9cd122213f3b995bc958f649dd8))
* Swap single angle quotation mark mappings ([#58](https://github.com/TwilioDevEd/message-segment-calculator/issues/58)) ([2bf29b9](https://github.com/TwilioDevEd/message-segment-calculator/commit/2bf29b9baa7a4c3f40d644217c0c205837822b62))
* Use actual byte count as capacity for international RCS segments ([450767a](https://github.com/TwilioDevEd/message-segment-calculator/commit/450767af92fb942bbd31824fe3a4db197cc1477a))
* Validate RCS region input at runtime ([cab25de](https://github.com/TwilioDevEd/message-segment-calculator/commit/cab25de505efd1c5c8f5fbea3b71c56091fcca56))


### Features

* Add 1,600-character API limit warning for RCS messages ([41dd87f](https://github.com/TwilioDevEd/message-segment-calculator/commit/41dd87f5c2c7741461141c8f60c17785784b0ece))
* Add 1,600-character API limit warning to SMS section ([5657573](https://github.com/TwilioDevEd/message-segment-calculator/commit/5657573de37d92d047f126defa2cbe833cc2dac5))
* Add RCS message support with redesigned docs UI ([eb01913](https://github.com/TwilioDevEd/message-segment-calculator/commit/eb019139fbd745302af7e8e1245c62d68f2dd309))
* Add RCS rich content (twilio/card) classification and segmentation ([ee65215](https://github.com/TwilioDevEd/message-segment-calculator/commit/ee65215b677b323e2b371af625801df948ae6d02))
* Add Twilio brand logo and favicon to docs site ([9250b24](https://github.com/TwilioDevEd/message-segment-calculator/commit/9250b24e0c37d16e9d2be0882a3b182f64865813))
* Make SMS and RCS sections collapsible with toggle indicator ([12464de](https://github.com/TwilioDevEd/message-segment-calculator/commit/12464de92c3a81eb1aedfb07726862b96a13dc97))
* Restore per-character detail view with UCS-2 highlighting ([a884c5c](https://github.com/TwilioDevEd/message-segment-calculator/commit/a884c5cb8aa39000c713a037b022694fac03c82b))

# [1.2.0](https://github.com/TwilioDevEd/message-segment-calculator/compare/v1.1.1...v1.2.0) (2022-10-04)


### Features

* **SmartEncoding:** Add support for Twilio's current SmartEncoding ([79fbec5](https://github.com/TwilioDevEd/message-segment-calculator/commit/79fbec565e237008221ca5aca24fce47bf5d4e70))
* **SmartEncoding:** Hyperlink "Smart Encoding" and prevent unreadable contrast issue ([d3410eb](https://github.com/TwilioDevEd/message-segment-calculator/commit/d3410ebb60178b1dc69affd2c337079756c3709e))

## [1.1.1](https://github.com/TwilioDevEd/message-segment-calculator/compare/v1.1.0...v1.1.1) (2021-10-12)


### Bug Fixes

* GSM-7 special character size calculation in UCS-2 encoding ([636ed81](https://github.com/TwilioDevEd/message-segment-calculator/commit/636ed814ed8b9de5b28002692df3d3acae2fc1b9))

# [1.1.0](https://github.com/TwilioDevEd/message-segment-calculator/compare/v1.0.2...v1.1.0) (2021-08-27)


### Features

* **core:** Add `getNonGsmCharacters()` method ([#11](https://github.com/TwilioDevEd/message-segment-calculator/issues/11)) ([159c838](https://github.com/TwilioDevEd/message-segment-calculator/commit/159c8383f3ab0d74ffb7c2c67cda13e61e39683e)), closes [#9](https://github.com/TwilioDevEd/message-segment-calculator/issues/9)

## [1.0.2](https://github.com/TwilioDevEd/message-segment-calculator/compare/v1.0.1...v1.0.2) (2021-08-19)


### Bug Fixes

* Bug in calculating one char UCS-2 ([f489fa2](https://github.com/TwilioDevEd/message-segment-calculator/commit/f489fa25bc2c13f1bf4c6e48f6c3bb2b0512b5af))
