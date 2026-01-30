// PNPM hook to rewrite package manifests during install/update.
// We remove @vercel/postgres from drizzle-orm peer deps to avoid
// pulling in a deprecated optional peer that we don't use.
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === "drizzle-orm") {
        // Strip @vercel/postgres peer dependency, which triggers a deprecation
        // warning during resolution even though it's optional and unused here.
        if (pkg.peerDependencies?.["@vercel/postgres"]) {
          const rest = { ...pkg.peerDependencies }
          delete rest["@vercel/postgres"]
          pkg.peerDependencies = rest
        }
        if (pkg.peerDependenciesMeta?.["@vercel/postgres"]) {
          const rest = { ...pkg.peerDependenciesMeta }
          delete rest["@vercel/postgres"]
          pkg.peerDependenciesMeta = rest
        }
      }
      return pkg
    },
  },
}
