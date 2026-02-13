import { v4 as uuidv4 } from 'uuid';
import client  from '../sanityClient.js'

const storage_plans_structure = [
  {
    _id: uuidv4(),
    plan_name: 'Free',
    storage_limit_gb: 5,
    vault_limit_records: 1000
  },
  {
    _id: uuidv4(),
    plan_name: 'Basic',
    storage_limit_gb: 10,
    vault_limit_records: 5000
  },
  {
    _id: uuidv4(),
    plan_name: 'Premium',
    storage_limit_gb: 50,
    vault_limit_records: 20000
  }
]


storage_plans_structure.forEach(async (plan) => {
  try {
    const result = await client.createIfNotExists({
      _type: 'storagePlans',
      _id: plan._id,
      plan_name: plan.plan_name,
      storage_limit_gb: plan.storage_limit_gb,
      vault_limit_records: plan.vault_limit_records,
    });
    console.log(`Storage Plan "${plan.plan_name}" created or already exists:`, result);
  } catch (error) {
    console.error(`Error creating storage plan "${plan.plan_name}":`, error);
  }
});



