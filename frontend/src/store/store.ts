import { create } from "zustand"
import { persist } from "zustand/middleware"

const authStore = (set: any) => ({
    jwt: null as any,
    setJwt: (key: any) => set(()=>({jwt: key})),
})

const useAuthStore = create(
    persist(authStore,{
        name:'authStore'
    })
)
export default useAuthStore;