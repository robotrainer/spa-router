class Router {
  /**
   * Контейнер встраивания страниц
   * @type {Element}
   */
  target;

  /**
   * Список путей до страниц
   * @type {Array<{path: string, view: Element}>}
   * 1. path - путь до страницы
   * 2. view - страница
   */
  routes;

  /**
   * Инициализирует роутер
   * @this {Router} объект Router
   * @param {{target: Element, routes: Array<{path: string, view: Element}>}} params
   * Параметры инициализации
   * 1. target - контейнер встривания страниц
   * 2. routes - список путей до страниц
   * 3. path - путь до страницы
   * 4. view - страница
   */
  initRouter(params) {
    this.target = params.target;
    this.routes = params.routes;

    this.#mount();
  }

  /**
   * Монтирует роутер
   * @private
   * @this {Router} объект Router
   */
  #mount() {
    window.addEventListener("popstate", () => {
      this.router();
    });

    const initNavigation = () => {
      document.body.addEventListener("click", (e) => {
        if (e.target.matches("[data-link]")) {
          e.preventDefault();
          this.#navigateTo(e.target.href);
        }
      });

      this.router();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initNavigation);
    } else {
      initNavigation();
    }
  }

  /**
   * Создаёт регулярное выражение из пути до страницы
   * @private
   * @this {Router} объект Router
   * @param {string} path - путь до страницы
   * @returns {RegExp} ругулярное выражение
   */
  #pathToRegex(path) {
    return new RegExp(
      "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$"
    );
  }

  /**
   * Направляет на указанный url страницы
   * @this {Router} объект Router
   * @param {string} url - полный адрес страницы
   */
  #navigateTo(url) {
    history.pushState(null, null, url);
    this.router();
  }

  /**
   * Получает значение параметра из пути до страницы
   * @this {Router} объект Router
   * @param {string} path - путь до страницы
   * @returns {Object<string, string | number | undefined>} значение параметра
   */
  getParams(path) {
    const local = location.pathname.match(this.#pathToRegex(path));

    const values = local.slice(1);
    const keys = Array.from(path.matchAll(/:(\w+)/g)).map(
      (result) => result[1]
    );

    return Object.fromEntries(
      keys.map((key, i) => {
        return [key, values[i]];
      })
    );
  }

  /**
   * Направляет на указанный endPoint страницы
   * @this {Router} объект Router
   * @param {string} endPoint - конечная точка путь до страницы
   */
  navigate(endPoint) {
    history.pushState(null, null, location.origin + endPoint);
    location.reload();
  }

  /**
   * Рендерит страницу по указанному пути
   * @this {Router} объект Router
   */
  async router() {
    const potentialMatches = this.routes.map((route) => {
      return {
        route: route,
        result: location.pathname.match(this.#pathToRegex(route.path)),
      };
    });

    let match = potentialMatches.find(
      (potentialMatch) => potentialMatch.result !== null
    );

    if (!match) {
      match = {
        route: this.routes[0],
        result: [location.pathname],
      };
    }

    const elem = await match.route.view();

    this.target.innerHTML = "";
    this.target.append(elem);
  }
}

export default new Router();
