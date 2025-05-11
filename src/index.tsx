// src/index.tsx
import { Hono } from 'hono';

// strict mode - 경로 구분 여부 설정
// 기본값은 strict: true 이고 다음을 다르게 취급한다
// /hello
// /hello/
// strict: false로 설정하면 두개를 동일 경로로 취급 
const app = new Hono();
// const app = new Hono({ strict: false});

// router 옵션 - 라우터 구현체 선택
// 기본값은 SmartRouter, 원하면 변경 가능
// import { RegExpRouter } from 'hono/router/reg-exp-router';
// const app = new Hono({
//   router: new RegExpRouter()
// });


// app.get('/', (c) => {
//   return c.text('Hello Hono!');
// });


// Generics - 타입안전한 환경변수와 컨텍스트 변수 설정
// Hono는 제네릭을 통해 env, c.set(), c.get()에 들어가는 값들의 타입을 미리 지정가능
// type Bindings = {
//   TOKEN: string;
// };

// type User = {
//   age: number;
//   name: string;
// };

// type Variables = {
//   user: User;
// };

// const app = new Hono<{
//   Bindings: Bindings;
//   Variables: Variables;
// }>();

// const user: User = { age: 34, name: "hi" };

// app.use('/auth/*', async (c, next) => {
//   const token = c.env.TOKEN; // 타입: string
//   c.set("user", user);
//   await next();
// });

// json 응답 반환 
app.get('/api/hello', (c) => {
  return c.json({
    ok: true,
    message: 'Hello Hono!',
  });
});

// url 경로 파라미터, 쿼리 파라미터를 읽고, 응답 헤더 추가하는 방법
// 과거에는 비표준(사용자 정의) 헤더임을 나타내기 위해 X- 접두사를 붙이는 관례
app.get('/posts/:id', (c) => {
  const page = c.req.query('page');      // 쿼리스트링 ?page=1
  const id = c.req.param('id');          // URL의 :id 부분
  c.header('X-Message', 'Hi!');          // 커스텀 응답 헤더
  return c.text(`You want to see ${page} of ${id}`);
});

// POST, PUT, DELETE
app.post('/posts', (c) => c.text('Created!', 201));

app.delete('/posts/:id', (c) =>
  c.text(`${c.req.param('id')} is deleted!`)
);

// HTML 반환:html() 헬퍼를 쓰거나 JSX 문법 사용 
// JSX를 쓰려면 파일명을 src/index.tsx로 바꾸고 런타임 설정도 함께 해줘야 함 
// JSX 예시
const View = () => {
  return (
    <html>
      <body>
        <h1>Hello Hono! </h1>
      </body>
    </html>
  );
};

app.get('/page', (c) => {
  return c.html(<View />);
});

// 원시 Response 반환
// 브라우저의 fetch()에서 받는 Response 객체 그대로 반환하는 방식
app.get('/', () => {
  return new Response('Good morning!');
});

// 미들웨어 사용 (Basic Auth 예시)
// 복잡한 작업을 대신해주는 미들웨어를 붙일수 있음, 기본인증 (Basic Auth)
import { basicAuth } from 'hono/basic-auth';

app.use(
  '/admin/*',
  // 로그인 팝업창이 뜸
  basicAuth({
    username: 'admin',
    password: 'secret',
  })
);

app.get('/admin', (c) => {
  return c.text('you are authorized!');
});

// 플랫폼별 어댑터 
// 플랫폼 특화기능은 어댑터를 import해서 사용함 
// 정적 파일 서빙, 웹소켓 등 
import { upgradeWebSocket } from 'hono/cloudflare-workers';

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    // 웹소켓 처리 로직 
    return c.text('sdfsdf');
  })
);

/**
 * ! Hono 인스턴스의 주요 메서드
 *
 * app.get/post/put/delete(path, handler)
 * HTTP 메서드별 라우팅
 *
 * app.all(path, handler)
 * 모든 메서드에 대해 처리
 *
 * app.on(method[], path[], handler)
 * 다양한 메서드/경로 조합 처리
 *
 * app.use(path?, middleware)
 * 미들웨어 등록 (전역 또는 경로별)
 *
 * app.route(path, app)
 * 서브 앱 연결 (라우팅 분리)
 *
 * app.basePath(path)
 * 모든 라우트에 기본 경로 추가
 *
 * app.notFound(handler)
 * 404 응답 커스터마이징
 *
 * app.onError(err, handler)
 * 에러 핸들링 정의
 *
 * app.mount(path, anotherApp)
 * 다른 앱을 지정 경로에 마운트
 *
 * app.fire()
 * Node.js에서 서버 실행 (Bun/Express-like 환경 전용)
 * 
 * app.fetch(req, env, event) 
 * Cloudflare 등 Fetch 기반 런타임에서 사용 
 * 
 * app.request(path, options)
 * 내부 요청 테스트용 API
 */

// Not Found 응답 커스터마이징 
// 404 페이지를 기본이 아닌 사용자 정의 메시지로 바꾸기 
app.notFound((c) => {
  return c.text('Custom 404 Message', 404);
});

// 에러 핸들링 커스터마이징
// 코드 중간에 오류가 나면 아래와 같은 핸들러에서 처리할 수 있음
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text('Custom Error Message', 500);
});

// 커스텀 HTTP 메서드 라우팅
// 일반적이지 않은 HTTP 메서드도 라우팅 가능함 
app.on('PURGE', '/cache', (c) => c.text('PURGE Method /cache'));

// 여러 메서드 동시 처리
app.on(['PUT', 'DELETE'], '/post', (c) =>
  c.text('PUT or DELETE /post')
);

// 여러 경로를 한번에 처리
// 다국어 URL 같은 경우 유용 
app.on('GET', ['/hello', '/ja/hello', '/en/hello'], (c) =>
  c.text('Hello')
);

// 모든 파라미터 한번에 받기
app.get('/posts/:id/comment/:comment_id', (c) => {
  const { id, comment_id } = c.req.param();
  return c.text(`id: ${id}, comment_id: ${comment_id}`);
});

// 선택적 파라미터 
// ?가 붙으면 해당 파라미터는 생략 가능 
// /api/animal 및 /api/animal/dog 둘다 매칭됨
app.get('/api/animal/:type?', (c) => c.text('Animal!'));

// RegExp, 정규표현식 기반 라우팅
// 숫자와 영문 조건 라우팅 
app.get('/post/:date{[0-9]+}/:title{[a-z]+}', (c) => {
  // /post/20240507/hello 매칭됨
  // /post/abcd/hello 매칭 안됨 
  const { date, title } = c.req.param();
  return c.text(`date: ${date}, title: ${title}`);
});

// 슬래시 포함 파일명 매칭 
// .+는 슬래시 포함까지 커버하는 패턴
app.get("/image/:filename{.+\\.png}", (c) => {
  // /image/test.png 매칭됨 filename: test.png
  // /image/a/image.png 슬래시 포함된 경로도 매칭됨 filename: a/test.png
  // .png로 끝나는 어떤 경로든 매칭한다는 의미 
  const filename = c.req.param('filename');
  return c.text(`filename: ${filename}`);
});

// 체이닝된 라우트
// 하나의 엔드포인트에서 여러 메서드를 체이닝 형태로 선언 가능
// /endpoint 경로에서 메서드별로 다른 동작 처리 
app
  .get('/endpoint', (c) => c.text('GET /endpoint'))
  .post((c) => c.text('POST /endpoint'))
  .delete((c) => c.text('DELETE /endpoint'));

// 라우트 그룹화 
// const book = new Hono();

// book.get('/', (c) => c.text('List Books'));
// book.get('/:id', (c) => c.text('Get Book: ' + c.req.param('id')));
// book.post('/', (c) => c.text('Create Book'));

// const app = new Hono();
// app.route('/book', book);

// 베이스 경로는 냅두고 그룹핑하기
// 기본 URL은 그대로 두고 여러 API 쪼개서 관리하고 싶을때 씀 
// Hono 인스턴스 생성
const book = new Hono();
book.get('/book', (c) => c.text('책 목록')); // GET /book 요청 처리 
book.post('/book', (c) => c.text('책 생성')); // POST /book 요청 처리

// 또 다른 Hono 인스턴스, 얘는 기본 경로가 /user
const user = new Hono().basePath('/user');
user.get('/', (c) => c.text('사용자 목록')); // GET /user 요청 처리
user.post('/', (c) => c.text('사용자 생성')); // POST /user 요청 처리 

// 메인 앱에 위에서 만든 애들 등록
// const app = new Hono();
app.route('/', book); // /book으로 시작하는 요청은 book이 처리
app.route('/', user); // /user로 시작하는 요청은 user가 처리 

// 호스트 이름으로 라우팅
// 가끔 URL에 www1.example.com/hello 처럼 호스트 이름까지 다 들어있는 경우가 있는데 이것도 문제없이 처리 가능 
// const app = new Hono({
//   // 요청 URL에서 프로토콜이랑 쿼리 스트링 다 날리고 호스트+경로만 남기는 함수
//   getPath: (req) => req.url.replace(/^https?:\/([^?]+).*$/, '$1'),
// });

app.get('/www1.example.com/hello', (c) => c.text('안녕 www1'));
app.get('/www2.example.com/hello', (c) => c.text('안녕 www2'));

// getPath 함수로 URL을 살짝 만져주면, 호스트 이름에 따라 다른 처리를 할 수 있음

// Host 헤더 값으로 라우팅
// const app = new Hono({
//   getPath: (req) =>
//     // Host 헤더 값이랑 URL 경로를 합쳐서 새로운 경로를 만들어냄
//     '/' +
//     req.headers.get('host') + // 예: www1.example.com
//     req.url.replace(/^https:\/\/[^/]+(\/[^?]*).*/, '$1'), // 예: /hello
// });

app.get('/www1.example.com/hello', (c) => c.text('안녕 www1'));

// 라우팅 우선순위
// Hono에서는 핸들러나 미들웨어를 등록한 순서대로 실행
app.get('/book/a', (c) => c.text('a')); // 1번선수
app.get('/book/:slug', (c) => c.text('공통')); // 2번선수
// GET /book/a 요청이 오면? -> 'a'가 응답 
// GET /book/b 요청이 오면? -> '공통'이 응답 

// 미들웨어는 핸들러보다 앞에 두라 
// 만약 모든 요청에 공통적으로 뭔가를 하고 싶다(로그남기기 같은거), 그러면 해당 미들웨어를 핸들러보다 앞에 써야함
app.use(logger()); // 로그 남기는 미들웨어
app.get('/foo', (c) => c.text('foo')); // 핸들러
// 반대로하면 핸들러가 다 처리하고 나서 로그 찍으려 하기 때문에 의미없음

// 특정 경로 다 처리하고 그래도 아무도 못잡는 요청이 있으면 그때 처리할 비상용 핸들러느 맨 뒤에 둬야함 
app.get('/bar', (c) => c.text('bar'));
app.get('*', (c) => c.text('비상용'));// 그룹핑 순서
// 라우트를 여러개 묶어서 관리할때 묶는 순서가 꼬이면 찾기 힘든 버그 생길수 있음
// app.route() 함수는 두 번째 인자로 받은 라우팅 정보를 가져와서 자기 자신의 라우팅 테이블에 추가하는 방식임
// 제대로 된 순서 
three.get('/hi', (c) => c.text('hi')); // 3단계 라우트 정의
two.route('/three', three); // 2단계에 3단계 라우트 연결 
app.route('/two', two); // 최상위에 2단계 라우트 연결 
// GET /two/three/hi 요청 -> 'hi' 응답 

export default app;
