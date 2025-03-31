# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


## Testing for app.jsx on the admin page
```js
{!isAuthenticated ? (
        <>
        <Routes>
          <Route path='/login' element={<Login />}/>
          {/* <Route path='*' element={<Navigate to='/login' replace />} /> */}
        </Routes>
        </>
      )
        : (
        <>
        <Navbar />
        <hr />
        <div className='flex w-full'>
          <Sidebar/>
          <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
            <Routes>
              <Route path='/add' element={<Add  />} />
              <Route path='/list' element={<List  />} />
              <Route path='/orders' element={<Orders  />} />

              {/* <Route path='*' element={<Navigate to='/add' replace />} /> */}
            </Routes>
          </div>
        </div>
        </>
       )
      }
```
