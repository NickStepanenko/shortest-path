import productsList from '@/products.json';

export type Product = {
  name?: string;
  icon?: string;
  x: number,
  y: number,
  paths?: Paths[]
};
type Paths = {
  product?: Product;
  path?: { x: number; y: number }[]
};

export const startPoint: Product = {
  name: "Start",
  icon: "💙",
  x: 0, y: 0,
};
export const finishPoint: Product = {
  name: "Finish",
  icon: "💸",
  x: 3, y: 0,
};

const MIN_FIELD_LENGTH_Y = 0;
const TOTAL_FIELD_LENGTH_Y = 3;
const AXIS_MIDDLE_Y = TOTAL_FIELD_LENGTH_Y / 2;

const calculatePath = (curPoint: Product, destination: Product, pathPoints: Product[] = []) => {
  const curPointX = curPoint.x;
  const curPointY = curPoint.y;
  const destinationX = destination.x;
  const destinationY = destination.y;

  if (curPointX ===  destinationX && curPointY === destinationY) {
    return pathPoints;
  }

  const xDifference = curPointX - destinationX;
  const yDifference = curPointY - destinationY;
  let newPoint = {} as Product;
  let newPathEntry = [] as Product[];
  let newYdir = 0;

  if (xDifference !== 0) {
    if (![TOTAL_FIELD_LENGTH_Y, MIN_FIELD_LENGTH_Y].includes(curPointY)) {
      newYdir = yDifference === 0 ? (curPointY <= AXIS_MIDDLE_Y ? -1 : 1 ) : (yDifference >= 0 ? -1 : 1);
      newPoint = { x: curPointX, y: curPointY + newYdir };
      newPathEntry = calculatePath(newPoint, destination, [...pathPoints, newPoint]).filter(elem => !pathPoints.includes(elem));
    }
    else {
      newPoint = { x: (xDifference > 0 ? curPointX - 1 : curPointX + 1), y: curPointY };
      newPathEntry = calculatePath(newPoint, destination, [...pathPoints, newPoint]).filter(elem => !pathPoints.includes(elem));
    }
  }
  else if (yDifference !== 0) {
    newYdir = yDifference === 0 ? (curPointY <= AXIS_MIDDLE_Y ? -1 : 1 ) : (yDifference >= 0 ? -1 : 1);
    newPoint = { x: curPointX, y: curPointY + newYdir };
    newPathEntry = calculatePath(newPoint, destination, [...pathPoints, newPoint]).filter(elem => !pathPoints.includes(elem));
  }
  
  pathPoints.push(...newPathEntry);

  return pathPoints;
};

const updateDistances = () => {
  productsList.forEach((product: Product) => {
    product.paths = [startPoint, ...productsList, finishPoint].map((elem) => ({
      product: elem,
      path: calculatePath(product, elem)
    })).filter((elem) => elem.product.name !== product.name);
  });

  startPoint.paths = [...productsList, finishPoint].map((elem) => ({
    product: elem,
    path: calculatePath(startPoint, elem)
  }));

  finishPoint.paths = [startPoint, ...productsList].map((elem) => ({
    product: elem,
    path: calculatePath(finishPoint, elem)
  }));
};

const getShortestPath = (productBucket: Product[] = []) => {
  let shortestPath: Product[] = [];
  let shortestPathProductsOrder: Product[] = [];

  const bucketProductsList: Product[] = productsList.filter((product) => productBucket.find((elem) => elem.name === product.name));
  const fullPath = [startPoint, ...bucketProductsList, finishPoint];

  let currentElem: Product = fullPath[0];
  shortestPathProductsOrder.push(currentElem);

  for (let i = 0; i < fullPath.length; i++) {
    const curElemClosestProduct: Paths[] = currentElem.paths?.sort((a: Paths, b: Paths) => (a?.path?.length || 0) - (b?.path?.length || 0))
      .filter((pathElem) => bucketProductsList.find((elem) => elem.name === pathElem?.product?.name))
      .filter((pathElem) => !shortestPathProductsOrder.find((elem) => elem?.name === pathElem?.product?.name)) || [];

    
    if (i === fullPath.length - 2) {
      const pathLeft: Paths = currentElem.paths?.find((elem) => elem?.product?.name === finishPoint.name) || {};
      shortestPath.push(...pathLeft?.path || []);
      shortestPathProductsOrder.push(finishPoint);
      break;
    }

    const closestProduct: Paths = curElemClosestProduct[0] || {};
    const nextElem = bucketProductsList.find((elem) => elem.name === closestProduct?.product?.name) as Product;
    currentElem = nextElem;

    shortestPath.push(...closestProduct?.path || []);
    shortestPathProductsOrder.push(nextElem);
  }

  return {
    shortestPath,
    shortestPathProductsOrder,
  }
};

const calculateStaticPath = (productsOrder: Product[] = []) => {
  const path = [];

  for (let i = 0; i < productsOrder.length - 1; i++) {
    const elemToFind = (i === productsOrder.length - 1 ? finishPoint : productsOrder[i + 1]);
    path.push(...productsOrder[i]?.paths?.find((elem) => elem?.product?.name === elemToFind?.name)?.path || []);
  }

  return path;
}

const optimizePath = (path: Product[] = [], productsOrder: Product[] = []) => {
  let shortestPath = [...path];
  let shortestPathProductsOrder = [...productsOrder];

  for (let i = 1; i < productsOrder.length; i++) {
    for (let j = i + 1; j < productsOrder.length; j++) {
      const newOrder = [
        ...productsOrder.slice(0, i),
        ...productsOrder.slice(i, j).reverse(),
        ...productsOrder.slice(j, productsOrder.length),
      ];
      const newPath = calculateStaticPath(newOrder) as Product[];

      if (newPath.length < shortestPath.length) {
        shortestPath = newPath;
        shortestPathProductsOrder = newOrder;
      }
    }
  }

  for (let i = 1; i < productsOrder.length - 1; i++) {
    for (let j = 1; j < productsOrder.length - 1; j++) {
      const newOrder = [
        ...productsOrder.slice(0, j + 1).filter((elem) => elem.name !== productsOrder[i].name),
        productsOrder[i],
        ...productsOrder.slice(j + 1, productsOrder.length).filter((elem) => elem.name !== productsOrder[i].name),
      ];

      const newPath = calculateStaticPath(newOrder) as Product[];

      if (newPath.length < shortestPath.length) {
        shortestPath = newPath;
        shortestPathProductsOrder = newOrder;
      }
    }
  }

  return {
    shortestPath,
    shortestPathProductsOrder,
  }
}

export const getPath = (productBucket: Product[] = []) => {
  updateDistances();

  const {
    shortestPath,
    shortestPathProductsOrder,
  } = getShortestPath(productBucket);

  const result = optimizePath(shortestPath, shortestPathProductsOrder);

  return {
    shortestPath: result.shortestPath,
    shortestPathProductsOrder: result.shortestPathProductsOrder,
  }
};
