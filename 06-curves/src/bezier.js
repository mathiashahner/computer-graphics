function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function binomialCoeff(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

function vec3Add(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function vec3Scale(v, scalar) {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

function generateBezierCurve(trajectory, segments) {
  const points = [];
  const n = trajectory.length - 1;
  const piece = 1.0 / segments;

  for (let j = 0; j <= segments; ++j) {
    const t = j * piece;
    let point = [0.0, 0.0, 0.0];

    for (let i = 0; i <= n; ++i) {
      const binCoeff = binomialCoeff(n, i);
      const bernstein = binCoeff * Math.pow(1 - t, n - i) * Math.pow(t, i);
      point = vec3Add(point, vec3Scale(trajectory[i], bernstein));
    }

    points.push(point);
  }

  return points;
}

export function initializeState(trajectory) {
  const curvePoints = generateBezierCurve(trajectory, 100);

  return {
    curvePoints,
    currentIndex: 0,
    progress: 0,
    totalPoints: curvePoints.length,
    isActive: true,
  };
}

export function updatePosition(object, deltaTime) {
  if (!object.trajectoryState || !object.trajectoryState.isActive) return;

  const state = object.trajectoryState;

  state.progress += object.speed * deltaTime;

  if (state.progress >= 1.0) state.progress = state.progress % 1.0;

  const floatIndex = state.progress * (state.totalPoints - 1);
  const currentIndex = Math.floor(floatIndex);
  const nextIndex = (currentIndex + 1) % state.totalPoints;
  const t = floatIndex - currentIndex;

  const currentPoint = state.curvePoints[currentIndex];
  const nextPoint = state.curvePoints[nextIndex];

  object.position[0] = currentPoint[0] + t * (nextPoint[0] - currentPoint[0]);
  object.position[1] = currentPoint[1] + t * (nextPoint[1] - currentPoint[1]);
  object.position[2] = currentPoint[2] + t * (nextPoint[2] - currentPoint[2]);
}
