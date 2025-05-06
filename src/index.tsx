// src/index.tsx
import { Hono } from 'hono';

const app = new Hono();

// app.get('/', (c) => {
//   return c.text('Hello Hono!');
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



export default app;
