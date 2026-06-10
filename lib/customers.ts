import { createClient } from "@/lib/supabase/client"

export async function getCustomers() {
  const supabase = createClient()
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.log("error", error)
    return []
  }

  return customers
}

export async function getCustomer(id: string) {
  const supabase = createClient()
  const { data: customer, error } = await supabase.from("customers").select("*").eq("id", id).single()

  if (error) {
    console.log("error", error)
    return null
  }

  return customer
}

export async function createCustomer(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zip: string,
) {
  const supabase = createClient()
  const { data: customer, error } = await supabase
    .from("customers")
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        address: address,
        city: city,
        state: state,
        zip: zip,
      },
    ])
    .select()
    .single()

  if (error) {
    console.log("error", error)
    return null
  }

  return customer
}

export async function updateCustomer(
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zip: string,
) {
  const supabase = createClient()
  const { data: customer, error } = await supabase
    .from("customers")
    .update({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      address: address,
      city: city,
      state: state,
      zip: zip,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.log("error", error)
    return null
  }

  return customer
}

export async function deleteCustomer(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) {
    console.log("error", error)
    return false
  }

  return true
}
