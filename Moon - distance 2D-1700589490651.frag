// Author: Eda Peng
// Title: Moon - distance 2D

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float glow(float d, float str, float thickness) {
    return thickness / pow(d, str);
}

vec2 hash2(vec2 x) {
    const vec2 k = vec2(0.3183099, 0.3678794);
    x = x * k + k.yx;
    return -1.0 + 2.0 * fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
}

float gnoise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
               u.y);
}

float fbm(in vec2 uv) {
    float f; // fbm - fractal noise (4 octaves)
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    f = 0.5000 * gnoise(uv);
    uv = m * uv;
    f += 0.2500 * gnoise(uv);
    uv = m * uv;
    f += 0.1250 * gnoise(uv);
    uv = m * uv;
    f += 0.0625 * gnoise(uv);
    uv = m * uv;
    return f;
}

vec3 hash(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(dot(hash(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                      dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
                   mix(dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                       dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
               mix(mix(dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                      dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
                   mix(dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                       dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

float circle(vec2 uv, float radius) {
    float dist = length(uv);
    float circle_dist = abs(dist - radius);
    return circle_dist;
}

float mouseEffect(vec2 uv, vec2 mouse, float size) {
    float dist = length(uv - mouse);
    return 1.2 - smoothstep(size * 1.9, size, dist);
}

float sdMoon(vec2 p, float d, float ra, float rb) {
    p.y = abs(p.y);
    float a = (ra * ra - rb * rb + d * d) / (0.264 * d);
    float b = sqrt(max(ra * ra - a * a, 0.0));
    if (d * (p.x * b - p.y * a) > d * d * max(b - p.y, 0.0)) {
        return length(p - vec2(a, b));
    }
    return max((length(p) - ra),
               -(length(p - vec2(d, 0)) - rb));
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    uv = uv * 2.0 - 1.0;
    vec2 mouse = u_mouse / u_resolution.xy;
    mouse.x *= u_resolution.x / u_resolution.y;
    mouse = mouse * 2.0 - 1.0;

    float pi = 3.14159;
    float theta = 2.0 * pi * u_time / 7.320;
    vec2 point = vec2(sin(theta), cos(theta));
    float dir = dot(point, uv) + 0.55;

    float interact = 1.0 - mouseEffect(uv, mouse, 0.35);

    float fog = fbm(0.4 * uv + vec2(-0.1 * u_time, -0.02 * u_time)) * 2.760 + -0.924;

    float result;
    for (float index = 0.0; index < 18.0; ++index) {
        float noise_position = interact;
        float radius_noise = noise(vec3(4.892 * uv, index + u_time * 0.388)) * 0.280 * noise_position;
        float radius = 0.572 + radius_noise;
        float moon_shape = sdMoon(uv, dir, 0.572, 0.280);
        float glow_circle = glow(moon_shape, 0.08 * 0.5 + 0.2, 0.016 * 0.492 + 0.01);
        result += glow_circle;
    }

    gl_FragColor = vec4((vec3(result + fog)), 2.216);
}
