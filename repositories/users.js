const fs = require('fs');
const crypto = require('crypto');  // for randomId

class UsersRepository {
  constructor(filename) {
    // check if filename is provided
    if (!filename) {
      throw new Error('Creating a repository requires a filename');
    }

    this.filename = filename;
 
    // access the file if exists, create it if not with an empty array
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  // read and return the JSON file as parsed as an array
  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: 'utf8'
      })
    );
  }

  // create a user, assign id, push it to JSON file
  // return attrs to easily access the user variable in index.js
  async create(attrs) {
    attrs.id = this.randomId();

    const records = await this.getAll();
    records.push(attrs);

    await this.writeAll(records);

    return attrs;
  }

  // write the records to JSON file (effectively update the JSON file)
  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)  // to have a readable JSON file
    );
  }

  // create a random id for user as an 8 char hexadecimal
  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }

  // retrieve a (singular) user's data by id
  async getOne(id) {
    const records = await this.getAll();
    return records.find(record => record.id === id);
  }

  // delete the user's data from JSON file (db) by id
  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter(record => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  // update (already created) user's data by the id and attribute
  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find(record => record.id === id);

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  // retrieve a user's data/record by filters
  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }
  }
}

// export pre-configured instance of UsersRepository
module.exports = new UsersRepository('users.json');