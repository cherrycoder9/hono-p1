// src/index.tsx
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

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
  )
}

app.get('/page', (c) => {
  return c.html(<View />);
});


export default app;
