# 음악사

르네상스부터 디지털 음악 제작까지 한 페이지를 스크롤하며 읽고 듣는 랜딩톤 출품 초안입니다.

`index.html`을 브라우저에서 열면 볼 수 있습니다. 설치와 빌드는 필요 없습니다. YouTube 임베드는 HTTP 또는 HTTPS로 사이트를 열어 확인하세요.

## 장별 음악 넣기

- 기본 곡이 비어 있으면 **이 장의 곡 듣기**로 이 페이지를 위해 합성한 짧은 예시 음원을 듣습니다.
- 내 브라우저에서 곡 주소를 넣거나 바꾸려면 페이지 주소 끝에 `?music=edit`를 붙여 열고 해당 장의 **이 장의 곡 듣기**를 누르세요. 주소 칸을 비워 저장하면 사이트 기본값으로 돌아옵니다.
- 방문자에게도 기본 곡을 제공하려면 [tracks.js](tracks.js)에서 해당 장의 `url`과 곡명, 감상 안내, 출처를 수정하세요.
- MP3나 WAV처럼 브라우저에서 직접 재생되는 음원 주소와 임베드가 허용된 YouTube 동영상 주소를 지원합니다. 공개하는 음원에는 필요한 출처와 라이선스를 표기하세요.

마지막 장에서는 멜로디를 재생한 뒤 노브를 돌려 사인파, 삼각파, 사각파를 섞어 들을 수 있습니다. 노브를 놓으면 관성과 감쇠가 적용됩니다. 키보드 화살표나 파형 버튼으로도 조절할 수 있습니다.

[랜딩톤 공고와 심사 기준](https://hackathon.parallax.kr/rounds/cmw91br1o0009pj5gyr5e85pp)

## 저작권 안내

1. 직접 만들었거나 사용 권리를 가진 작품만 출품할 수 있습니다.
2. 이미지, 글꼴, 음원, 영상, 코드, AI 생성물 등 외부 자료를 쓸 때는 라이선스를 직접 확인하고, 필요한 출처 표기를 해 주세요.
3. 출품작의 저작권은 참가자에게 있습니다. 운영진은 심사, 갤러리 공개, 결과 발표와 해커톤 및 패럴렉스 서비스 홍보(웹사이트, SNS, 블로그 등)에 출품작의 이름, 링크, 스크린샷, 영상을 사용할 수 있습니다.
4. 권리 침해에 대한 책임은 출품자에게 있습니다. 침해가 확인되면 출품작을 숨기거나 관련 자료를 삭제하고 심사와 수상에서 제외할 수 있습니다.

## 본문과 음원

르네상스의 예배당과 합창 문화는 메트로폴리탄 미술관의 [르네상스 음악 해설](https://www.metmuseum.org/essays/music-in-the-renaissance)을, 바로크의 극장 문화는 같은 미술관의 [오페라 해설](https://www.metmuseum.org/essays/the-opera)을 참고했습니다. 음렬과 역행은 [아르놀트 쇤베르크 센터의 12음 기법 전시](https://schoenberg.at/en/exhibitions/online-exhibitions/composition-with-12tones-online)를 참고했습니다.

저장소의 모더니즘 예시 음원은 페이지의 연습 악보에 보이는 두 줄을 차례로 연주합니다.

- 알레그리 〈미제레레〉는 Ensamble Escénico Vocal의 연주를 위키미디어 공용에서 내려받아 MP3로 재생합니다. [녹음 출처](https://commons.wikimedia.org/wiki/File:Allegri_-_Miserere_Mei%2C_Deus_-_Ensamble_Esc%C3%A9nico_Vocal_%28audio%29.ogg), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)
- 비발디 〈겨울〉 1악장은 John Harrison이 바이올린을 맡고 Robert Turizziani가 Wichita State University Chamber Players를 지휘한 녹음입니다. 위키미디어 공용의 Ogg 파일을 MP3로 변환했습니다. [녹음 출처](https://commons.wikimedia.org/wiki/File:Vivaldi_-_Four_Seasons_4_Winter_mvt_1_Allegro_non_molto_-_John_Harrison_violin.oga), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- 베토벤 《월광》 1악장은 Paul Pitman의 Musopen 녹음입니다. Musopen은 이 녹음을 퍼블릭 도메인으로 공개했습니다. [녹음 출처](https://commons.wikimedia.org/wiki/File:Ludwig_van_Beethoven_-_sonata_no._14_in_c_sharp_minor_%27moonlight%27%2C_op._27_no._2_-_i._adagio_sostenuto.ogg)
- 차이콥스키 〈사탕 요정의 춤〉은 Incompetech에서 받은 Kevin MacLeod의 편곡을 재생합니다. [녹음 출처](https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1100625), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- 쇤베르크 《피아노 모음곡》 Op. 25의 〈인터메초〉는 Florent Boffard의 연주가 실린 유튜브 영상의 4:37부터 재생합니다. [연주 영상](https://www.youtube.com/watch?v=bQHR_Z8XVvI&t=277s), [쇤베르크 센터 작품 해설](https://schoenberg.at/en/schoenberg/kompositionen/suite-for-piano-op-25)
- A2O LITE의 〈NEON〉은 A2O WORLD 공식 YouTube 영상으로 연결합니다. [공식 영상](https://www.youtube.com/watch?v=D968qfUZMUE)

## 시각 자료 출처

- 표지의 바이올린과 악보는 AI 생성 이미지입니다.
- 르네상스와 바로크는 메트로폴리탄 미술관이 퍼블릭 도메인으로 표시한 [성가책 삽화](https://www.metmuseum.org/art/collection/search/929276)와 [무대 원근 설계](https://www.metmuseum.org/art/collection/search/341372)입니다.
- 고전주의는 웰컴 컬렉션의 [연주를 준비하는 네 음악가](https://wellcomecollection.org/works/yx8dkrta)입니다. 공개 기록의 권리 표기는 Public Domain Mark입니다.
- 낭만주의의 [폴로네즈 삽화](https://commons.wikimedia.org/wiki/File:Kossak_-_Polonez_D%C4%85browskiego.jpg), [하르당에르 혼례 행렬](https://commons.wikimedia.org/wiki/File:Adolph_Tidemand_%26_Hans_Gude_-_Bridal_Procession_on_the_Hardangerfjord_-_Google_Art_Project.jpg), [한여름의 춤](https://commons.wikimedia.org/wiki/File:Zorn_-_Midsummer_Dance.jpg), [쿠르스크 지방의 원무](https://commons.wikimedia.org/wiki/File:Trutovsky_001.jpg)는 위키미디어 공용에서 퍼블릭 도메인으로 표시한 자료입니다.
- 모더니즘의 연습곡 악보와 디지털 음악 제작의 피아노 롤은 이 페이지용으로 제작했습니다. 피아노 롤의 음표는 마지막 체험에서 재생하는 멜로디와 같습니다.
