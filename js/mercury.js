/* Liquid mercury hero: raymarched metaballs reflecting a procedural studio + neon environment. No libraries. */
(() => {
  const cv = document.getElementById('merc');
  if (!cv) return;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { cv.style.background = 'radial-gradient(40% 50% at 70% 50%, #3b4658, #04050a)'; return; }

  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `
precision highp float;
uniform vec2 R; uniform float T; uniform vec2 M; uniform float S;
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float map(vec3 p){
  float d=1e9;
  for(int i=0;i<6;i++){
    float f=float(i);
    vec3 c=vec3(sin(T*.42+f*1.7)*1.5, cos(T*.53+f*2.3)*.95, sin(T*.31+f*3.1)*.7);
    d=smin(d,length(p-c)-(.46+.14*sin(f*2.+T*.9)),.8);
  }
  d=smin(d,length(p-vec3(M.x*1.9,M.y*1.1,.1))-.42,.9);
  return d;
}
vec3 nrm(vec3 p){vec2 e=vec2(.0025,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.03,.035,.05),vec3(.78,.84,.93),smoothstep(-.25,.55,r.y));
  c+=vec3(.9)*exp(-pow((r.y-.02)*9.,2.))*.9;
  c*=.8+.25*sin(r.x*2.2+1.);
  c+=vec3(1.)*smoothstep(.9,.985,dot(r,normalize(vec3(.35,.85,.45))))*3.4;
  c+=vec3(1.,.98,.95)*smoothstep(.95,.995,dot(r,normalize(vec3(-.5,.35,-.7))))*2.4;
  c+=vec3(.43,.95,1.)*smoothstep(.86,.96,dot(r,normalize(vec3(-.85,.15,.35))))*2.6;
  c+=vec3(.72,.62,1.)*smoothstep(.86,.96,dot(r,normalize(vec3(.8,-.35,.55))))*2.;
  return c;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
  float wide=clamp(R.x/R.y-1.,0.,1.);
  float port=clamp(1.-R.x/R.y,0.,1.);
  vec3 ro=vec3(-1.3*wide,-.45-1.9*port+.5*S,-7.2-2.8*port);
  vec3 rd=normalize(vec3(uv*vec2(1.,1.),1.55));
  float t=0.,d=1.;
  for(int i=0;i<72;i++){d=map(ro+rd*t);if(d<.0015||t>9.)break;t+=d*.9;}
  vec3 col=vec3(.016,.02,.034);
  col+=vec3(.05,.12,.15)*exp(-3.5*length(uv-vec2(.35*wide,-.05)));
  if(t<9.){
    vec3 p=ro+rd*t,n=nrm(p),r=reflect(rd,n);
    float fr=pow(1.-max(dot(n,-rd),0.),3.);
    vec3 e=env(r);
    float l=dot(e,vec3(.3,.59,.11));
    e=mix(vec3(l),e,.5);
    col=e*(.7+.5*fr);
    col+=vec3(.43,.95,1.)*pow(fr,2.)*.5;
    col+=env(refract(rd,n,.82))*.06;
  }
  col=pow(col,vec3(.92));
  col*=1.-.45*dot(uv,uv);
  gl_FragColor=vec4(col,1.);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uR = U('R'), uT = U('T'), uM = U('M'), uS = U('S');

  let scale = .9, mx = 0, my = 0, tx = 0, ty = 0, vis = true, t0 = performance.now();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5) * scale;
    cv.width = Math.max(2, Math.floor(cv.clientWidth * dpr));
    cv.height = Math.max(2, Math.floor(cv.clientHeight * dpr));
    gl.viewport(0, 0, cv.width, cv.height);
  }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 2; ty = -(e.clientY / innerHeight - .5) * 2; });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: 0 }).observe(cv);

  let slow = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!vis || document.hidden) return;
    const dt = now - (frame.l || now); frame.l = now;
    // adaptive quality: if frames are slow, drop internal resolution once or twice
    if (dt > 34) { if (++slow > 25 && scale > .45) { scale -= .15; slow = 0; size(); } } else slow = Math.max(0, slow - 1);
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    const sy = Math.min(scrollY / innerHeight, 1.2);
    gl.uniform2f(uR, cv.width, cv.height);
    gl.uniform1f(uT, reduce ? 3. : (now - t0) / 1000);
    gl.uniform2f(uM, mx, my);
    gl.uniform1f(uS, sy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(frame);
})();
