import { create } from "zustand"
import { persist } from "zustand/middleware"

const authStore = (set) => ({
    jwt: null,
    setJwt: (key) => set(()=>({jwt: key})),
})

const useAuthStore = create(
    persist(authStore,{
        name:'authStore'
    })
)
export default useAuthStore;