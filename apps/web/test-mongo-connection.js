const { MongoClient } = require('mongodb')

async function testMongoConnection() {
  const mongoUrl = process.env.CONSEILLER_NUMERIQUE_MONGODB_URL

  if (!mongoUrl) {
    console.error(
      '❌ CONSEILLER_NUMERIQUE_MONGODB_URL environment variable is not set',
    )
    process.exit(1)
  }

  console.log('🔍 Testing MongoDB connection...')
  console.log(`📡 URL: ${mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`) // Hide credentials

  const client = new MongoClient(mongoUrl, {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  })

  try {
    console.log('🔄 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Successfully connected to MongoDB!')

    // Test a simple query
    console.log('🔍 Testing database access...')
    const db = client.db()
    const collections = await db.listCollections().toArray()
    console.log(`📊 Found ${collections.length} collections:`)
    for (const col of collections) {
      console.log(`  - ${col.name}`)
    }

    // Test a simple query on conseillers collection if it exists
    const conseillersCollection = db.collection('conseillers')
    const count = await conseillersCollection.countDocuments()
    console.log(`👥 Found ${count} documents in 'conseillers' collection`)

    // Test a simple find query with limit
    const sampleDoc = await conseillersCollection.findOne({}, { limit: 1 })
    if (sampleDoc) {
      console.log('📄 Sample document structure:')
      console.log(`  - _id: ${sampleDoc._id}`)
      console.log(`  - nom: ${sampleDoc.nom || 'N/A'}`)
      console.log(`  - email: ${sampleDoc.email || 'N/A'}`)
    }

    console.log('🎉 All tests passed! MongoDB connection is working correctly.')
  } catch (error) {
    console.error('❌ MongoDB connection failed:')
    console.error(`   Error: ${error.message}`)
    console.error(`   Code: ${error.code}`)
    console.error(`   Name: ${error.name}`)

    if (error.code === 'ENOTFOUND') {
      console.error('   💡 This looks like a DNS resolution issue')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   💡 This looks like a connection refused issue')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   💡 This looks like a timeout issue')
    } else if (error.code === 'MongoServerSelectionError') {
      console.error('   💡 This looks like a MongoDB server selection issue')
    }

    process.exit(1)
  } finally {
    await client.close()
    console.log('🔌 Connection closed')
  }
}

// Run the test
testMongoConnection().catch(console.error)
