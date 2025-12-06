---
applyTo: "frontend/**"
---

# Repo Structure Example:

src/
  api/
    instance.ts
    endpoints.ts
    auth.api.ts
    users.api.ts
    ...
  
  assets/
    images/
    icons/
    fonts/
  
  components/
    Button/
      Button.tsx
      Button.style.ts
      Button.types.ts
      Button.utils.ts
      Button.constants.ts
      Button.hooks.ts
      Button.queries.ts
      Button.mutations.ts
      index.ts
    Input/
      ...
    Layout/
      ...
      components/
        UserInfo/
          UserInfo.tsx
          UserInfo.style.ts
          ...
  
  constants/
    routes.constants.ts
    theme.constants.ts
    queryKeys.constants.ts
    storage.constants.ts
    ...

  hooks/
    useTheme.ts
    useAuth.ts
    useDebounce.ts
    ...

  i18n/
    en.json
    index.ts

  mutations/
    user.mutations.ts
    auth.mutations.ts
    ...

  pages/
    Home/
      Home.tsx
      Home.style.ts
      Home.types.ts
      Home.utils.ts
      Home.constants.ts
      Home.hooks.ts
      Home.queries.ts
      Home.mutations.ts
      index.ts
      components/
        UserInfo/
          UserInfo.tsx
          UserInfo.style.ts
          ...
    Login/
      ...
    Dashboard/
      ...

  queries/
    user.queries.ts
    auth.queries.ts
    ...

  router/
    AppRouter.tsx
    ProtectedRoute.tsx
    routes.ts

  store/
    index.ts
    slices/
      user.slice.ts
      theme.slice.ts

  theme/
    index.ts
    light.ts
    dark.ts

  types/
    IUser.ts
    IApiResponse.ts
    IPagination.ts
    ILoginForm.ts
    ...

  utils/
    formatDate.ts
    convertCurrency.ts
    env.ts
    validators.ts
    ...

  app/
    App.tsx
    Providers.tsx
    index.css

  main.tsx
  vite-env.d.ts
