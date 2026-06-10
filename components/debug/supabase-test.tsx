"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const SupabaseTest = () => {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("test").select("*")

        if (error) {
          setError(error)
        } else {
          setData(data)
        }
      } catch (err: any) {
        setError(err)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Supabase Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default SupabaseTest
