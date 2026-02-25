"use client"

export function Stats() {
  const stats = [
    { label: "Active Users", value: "2.5M+" },
    { label: "Files Stored", value: "500B+" },
    { label: "Uptime", value: "99.99%" },
    { label: "Data Centers", value: "15+" },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-foreground/70 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
